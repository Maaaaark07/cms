import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import certificateTemplate from '../assets/CertificateTemplate.jpg';

const CertificatePreview = ({ message, brgyOfficials, certificateTitle, date }) => {
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
            width: '30%',
        },
        sangguniangBarangayText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#7b0d16',
            marginBottom: 10,
        },
        officialItem: {
            marginBottom: 10,
            flexDirection: 'column',
            alignItems: 'center',
        },
        officialName: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        officialPosition: {
            fontSize: 10,
            color: '#2d597d',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
        },
        mgaKagawadText: {
            fontSize: 14,
            marginTop: 5,
            marginBottom: 5,
            fontWeight: 'bold',
            color: '#7b0d16',
        },
        messageSection: {
            width: '60%',
            fontSize: 14,
            textAlign: 'justify',
            lineHeight: 1.5,
            marginTop: '30px',
            marginLeft: 'auto',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        dateText: {
            fontSize: 14,
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
                        <Text style={styles.sangguniangBarangayText}>Sangguniang Barangay</Text>
                        {brgyOfficials?.map((official, index) => (
                            <View key={index} style={styles.officialItem}>
                                <Text style={styles.officialName}>{official.full_name}</Text>
                                <Text style={styles.officialPosition}>{official.committee}</Text>
                                {index === 0 && (
                                    <Text style={styles.mgaKagawadText}>Mga Kagawad:</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.messageSection}>
                        <Text style={styles.dateText}>{date}</Text>
                        <Text style={styles.messageText}>{message}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default CertificatePreview;