import { SerialPort } from 'serialport';
import dotenv from 'dotenv';
dotenv.config();

const PORT_PATH = process.env.SMS_PORT || '';
const BAUD_RATE = Number(process.env.SMS_BAUD || 115200);
const DRY_RUN = String(process.env.SMS_DRY_RUN || '').toLowerCase() === 'true';
const SEND_DELAY_MS = Number(process.env.SMS_SEND_DELAY_MS || 2500);

let port = null;
let opening = null;
let queue = Promise.resolve();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const normalizePhNumber = (raw) => {
    if (!raw) return null;
    let value = String(raw).replace(/[^\d+]/g, '');
    if (value.startsWith('+')) value = value.slice(1);
    if (value.startsWith('0') && value.length === 11) value = `63${value.slice(1)}`;
    if (value.startsWith('9') && value.length === 10) value = `63${value}`;
    if (!/^63\d{10}$/.test(value)) return null;
    return value;
};

const waitFor = (serial, predicate, timeoutMs = 15000) => {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const onData = (chunk) => {
            buffer += chunk.toString();
            if (predicate(buffer)) {
                cleanup();
                resolve(buffer);
            }
        };
        const onError = (error) => {
            cleanup();
            reject(error);
        };
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`SIM7600 timeout. Last response: ${buffer.trim() || '(empty)'}`));
        }, timeoutMs);
        const cleanup = () => {
            clearTimeout(timer);
            serial.off('data', onData);
            serial.off('error', onError);
        };
        serial.on('data', onData);
        serial.on('error', onError);
    });
};

const writeAndWait = async (serial, command, predicate, timeoutMs) => {
    const wait = waitFor(serial, predicate, timeoutMs);
    serial.write(command);
    return wait;
};

const getPort = async () => {
    if (DRY_RUN) return null;
    if (!PORT_PATH) {
        throw new Error('SMS_PORT is not set. Example Windows: COM3. Example Linux: /dev/ttyUSB2');
    }
    if (port?.isOpen) return port;
    if (opening) return opening;

    opening = new Promise((resolve, reject) => {
        const nextPort = new SerialPort({
            path: PORT_PATH,
            baudRate: BAUD_RATE,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            autoOpen: false,
        });

        nextPort.open((error) => {
            opening = null;
            if (error) {
                reject(new Error(`Cannot open SIM7600 port ${PORT_PATH}: ${error.message}`));
                return;
            }
            port = nextPort;
            port.on('close', () => {
                port = null;
            });
            resolve(port);
        });
    });

    return opening;
};

const sendOneSms = async (number, message) => {
    const normalized = normalizePhNumber(number);
    if (!normalized) {
        throw new Error(`Invalid mobile number: ${number}`);
    }
    if (!message || !String(message).trim()) {
        throw new Error('Message is required');
    }

    if (DRY_RUN) {
        console.log(`[SMS DRY RUN] To ${normalized}: ${message}`);
        return { phone: normalized, status: 'simulated' };
    }

    const serial = await getPort();
    await delay(200);
    await writeAndWait(serial, 'AT\r', (buf) => buf.includes('OK') || buf.includes('ERROR'), 8000);
    await writeAndWait(serial, 'AT+CMGF=1\r', (buf) => buf.includes('OK') || buf.includes('ERROR'), 8000);
    await writeAndWait(
        serial,
        `AT+CMGS="${normalized}"\r`,
        (buf) => buf.includes('>') || buf.toUpperCase().includes('ERROR'),
        15000
    );

    const response = await writeAndWait(
        serial,
        `${message}${String.fromCharCode(26)}`,
        (buf) => buf.includes('OK') || buf.toUpperCase().includes('ERROR') || buf.includes('+CMGS:'),
        45000
    );

    if (response.toUpperCase().includes('ERROR')) {
        throw new Error(`Modem rejected SMS to ${normalized}`);
    }

    return { phone: normalized, status: 'sent' };
};

export const getModemStatus = async () => {
    if (DRY_RUN) {
        return { connected: false, dryRun: true, port: PORT_PATH || null, message: 'SMS_DRY_RUN is enabled' };
    }
    if (!PORT_PATH) {
        return { connected: false, dryRun: false, port: null, message: 'SMS_PORT is not configured' };
    }
    try {
        const serial = await getPort();
        const response = await writeAndWait(serial, 'AT\r', (buf) => buf.includes('OK') || buf.includes('ERROR'), 5000);
        return {
            connected: response.includes('OK'),
            dryRun: false,
            port: PORT_PATH,
            message: response.includes('OK') ? 'SIM7600G-H ready' : 'Modem did not respond OK',
        };
    } catch (error) {
        return {
            connected: false,
            dryRun: false,
            port: PORT_PATH,
            message: error.message,
        };
    }
};

export const sendSmsMessages = async (numbers, message, onProgress) => {
    const uniqueNumbers = [...new Set(numbers.map(normalizePhNumber).filter(Boolean))];
    const results = [];

    for (let index = 0; index < uniqueNumbers.length; index += 1) {
        const phone = uniqueNumbers[index];
        const job = queue.then(async () => {
            try {
                const sent = await sendOneSms(phone, message);
                results.push({ phone, status: sent.status });
            } catch (error) {
                results.push({ phone, status: 'failed', error: error.message });
            } finally {
                if (onProgress) onProgress(results[results.length - 1], index + 1, uniqueNumbers.length);
                if (index < uniqueNumbers.length - 1) {
                    await delay(SEND_DELAY_MS);
                }
            }
        });
        queue = job.catch(() => {});
        await job;
    }

    return results;
};
