import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import certificateTemplate from '../assets/CertificateTemplate.jpg';

const CertificatePreview = ({ message, brgyOfficials, certificateTitle, date }) => {

    Font.register({
        family: 'Arimo',
        fonts: [
            {
                src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50Xew-FGC_p9dw.ttf',
                fontWeight: 'bold'
            },
            {
                src: 'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWyWrFCbw7A.ttf',
                fontWeight: 'normal'
            },
            {
                src: 'https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0RkyFjaVcUwaERZjA.ttf',
                fontWeight: 'thin'
            }
        ]
    });

    Font.register({
        family: 'Open Sans',
        fonts: [
            {
                src: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObjwSVZyOOSr4dVJWUgshZ1y4nY1M2xLER.ttf',
                fontWeight: 'bold'
            }
        ]
    });

    const styles = StyleSheet.create({
        page: {
            backgroundColor: '#fff',
            width: '100%',
            height: '100%',
            fontFamily: 'Times-Roman',
        },
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        },
        title: {
            position: 'absolute',
            top: 190,
            left: 0,
            right: 0,
            fontSize: 22,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 20,
        },
        content: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 50,
            marginTop: 200,
        },
        officialsSection: {
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '30px',
            width: '40%',
        },
        sangguniangBarangayText: {
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Arimo',
            color: '#7b0d16',
            marginBottom: 10,
        },
        officialItem: {
            marginBottom: 10,
            flexDirection: 'column',
            alignItems: 'center',
        },
        firstOfficialName: {
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Open Sans',
            color: '#2d597d',
        },
        additionalOfficialName: {
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Open Sans',
            color: '#000000',
        },
        officialPosition: {
            fontSize: 10,
            color: '#2d597d',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            fontFamily: 'Arimo',
            fontWeight: 'normal'
        },
        mgaKagawadText: {
            fontSize: 12,
            marginTop: 7,
            fontWeight: 'bold',
            color: '#7b0d16',
            fontFamily: 'Arimo',
        },
        messageSection: {
            width: '55%',
            fontSize: 14,
            textAlign: 'justify',
            lineHeight: 1.5,
            marginTop: '30px',
            marginLeft: 'auto',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        dateText: {
            fontSize: 12,
            textAlign: 'right',
            marginBottom: 10,
        },
        messageText: {
            fontSize: 12,
        }
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image src={certificateTemplate} style={styles.backgroundImage} fixed />

                <Text style={styles.title}>{certificateTitle}</Text>

                <View style={styles.content}>
                    <View style={styles.officialsSection}>
                        <Text style={styles.sangguniangBarangayText}>SANGGUNIANG BARANGAY</Text>
                        {brgyOfficials?.map((official, index) => (
                            <View key={index} style={styles.officialItem}>
                                <Text
                                    style={index === 0
                                        ? styles.firstOfficialName
                                        : styles.additionalOfficialName}
                                >
                                    {official.full_name}
                                </Text>
                                <Text style={styles.officialPosition}>{official.committee}</Text>
                                {index === 0 && (
                                    <Text style={styles.mgaKagawadText}>MGA KAGAWAD:</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.messageSection}>
                        <Text style={styles.dateText}>{date}</Text>
                        <Text style={styles.messageText}>
                            {message.map((part, index) => (
                                <Text
                                    key={index}
                                    style={part.isBold ? { fontWeight: 'thin', fontFamily: 'Arimo', fontSize: 11 } : {}}
                                >
                                    {part.text}
                                </Text>
                            ))}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default CertificatePreview;