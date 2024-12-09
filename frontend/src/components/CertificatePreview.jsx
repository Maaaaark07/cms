import React from 'react';
import { Document, Page, Text, StyleSheet, Image, View } from '@react-pdf/renderer';
import certificateTemplate from '../assets/CertificateTemplate.jpg';

const CertificatePreview = ({ message }) => {
    const styles = StyleSheet.create({
        page: {
            backgroundColor: '#ffff',
            position: 'relative',
            width: '100%',
            height: '100%',
            fontSize: 12,
        },
        backgroundImage: {
            position: 'relative',
            top: 0,
            left: '8.5%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            zIndex: 10,
        },
        text: {
            fontSize: 14,
            color: 'black',
            paddingTop: 200,
            position: 'absolute',
            right: '40px',
        },
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Background Image */}
                <Image src={certificateTemplate} style={styles.backgroundImage} fixed />
                {/* Overlay Text */}
                <Text style={styles.text}>{message}</Text>
            </Page>
        </Document>
    );
};

export default CertificatePreview;