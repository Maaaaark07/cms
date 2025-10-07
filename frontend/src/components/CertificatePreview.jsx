import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import CooperBlack from '../../src/assets/fonts/COOPBL.woff';
import TimesRomanBold from '../../src/assets/fonts/timesbd.ttf';
import TimesRoman from '../../src/assets/fonts/times.ttf';
import Calibri from '../../src/assets/fonts/calibri.ttf';
import certificateTemplate from "../assets/templates/ColoCertificateTemplate.jpg";

const disableHyphenation = (word) => [word];

const CertificatePreview = ({
  message,
  brgyOfficials,
  certificateTitle,
  date,
}) => {
  Font.register({
    family: "Arimo",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50Xew-FGC_p9dw.ttf",
        fontWeight: "bold",
      },
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWyWrFCbw7A.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0RkyFjaVcUwaERZjA.ttf",
        fontWeight: "thin",
      },
    ],
  });

  Font.register({
    family: "Open Sans",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObjwSVZyOOSr4dVJWUgshZ1y4nY1M2xLER.ttf",
        fontWeight: "bold",
      },
    ],
  });

  Font.register({
    family: "Cooper Black",
    src: CooperBlack,
    hyphenationCallback: (word) => [word],
  });

  Font.register({
    family: "Times New Roman Bold",
    src: TimesRomanBold,
    hyphenationCallback: (word) => [word],
  });

  Font.register({
    family: "Times New Roman",
    src: TimesRoman,
    hyphenationCallback: (word) => [word],
  });

  Font.register({
    family: "Calibri",
    src: Calibri,
    hyphenationCallback: (word) => [word],
  });

  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      width: "100%",
      height: "100%",
      fontFamily: "Times New Roman Bold",
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    title: {
      position: "absolute",
      top: 200,
      left: 190,
      right: 0,
      fontSize: 15,
      //fontWeight: "800",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      //fontFamily: "Arimo",
      fontFamily: "Times New Roman Bold"
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 25,
      marginTop: 200,
    },
    officialsSection: {
      flexDirection: "column",
      alignItems: "center",
      marginTop: -10,
      width: "30%",
    },
    sangguniangBarangayText: {
      fontSize: 10,
      fontWeight: "bold",
      fontFamily: "Arimo",
      color: "#7b0d16",
      marginBottom: 10,
    },
    officialItem: {
      marginTop: 5,
      marginBottom: 7,
      flexDirection: "column",
      alignItems: "center",
    },
    firstOfficialName: {
      fontSize: 13,
      fontWeight: "bold",
      //fontFamily: "Open Sans",
      fontFamily: "Cooper Black",
      color: "#000000ff",
    },
    additionalOfficialName: {
      fontSize: 12,
      fontWeight: "bold",
      //fontFamily: "Open Sans",
      fontFamily: "Cooper Black",
      color: "#000000ff",
    },
    CaptainPosition: {
      fontSize: 11,
      color: "#18b7fbff",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      fontFamily: "Calibri",
      fontWeight: "bold",
    },
    officialPosition: {
      fontSize: 9,
      color: "#18b7fbff",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      fontFamily: "Calibri",
      fontWeight: "bold",
    },
    mgaKagawadText: {
      fontSize: 10,
      marginTop: 3,
      fontWeight: "bold",
      color: "#7b0d16",
      fontFamily: "Arimo",
    },
    messageSection: {
      width: "60%",
      fontSize: 12,
      textAlign: "justify",
      lineHeight: 2,
      marginTop: "30px",
      marginLeft: "auto",
      flexDirection: "column",
      alignItems: "flex-end",
      textIndent: 4,
    },
    dateText: {
      fontSize: 13,
      textAlign: "right",
      marginBottom: 10,
    },
    messageText: {
      fontFamily: "Times New Roman",
      fontSize: 11,
      textIndent: 4,
      textAlign: "justify",
    },
    esignature_img: {
      position: "absolute",
      left: 420,
      bottom: -20,
      width: 115,
    },
    signature_bold: {
      position: "absolute",
      left: 405,
      bottom: -30,
      width: 150,
      fontSize: 12,
      textAlign: 'center',
      fontFamily: "Times New Roman Bold",
      color: "#000000ff"
    },
    signature: {
      position: "absolute",
      left: 405,
      bottom: -30,
      width: 150,
      fontSize: 12,
      textAlign: 'center',
      fontFamily: "Times New Roman",
      color: "#000000ff"
    },
    controlnumber: {
      position: "absolute",
      left: 420,
      bottom: -60,
      width: 150,
      fontSize: 12,
      fontFamily: 'Arimo',
      color: "#000000ff",
      fontWeight: 'bold',
    },
    profilepic: {
      position: "absolute",
      left: 235,
      bottom: -30,
      width: 110,
      border: '0.5px solid black'
    },
    reqsignature: {
      position: "absolute",
      left: 225,
      bottom: -60,
      width: 125,
      fontSize: 12,
      textAlign: 'center',
    },

  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={certificateTemplate} style={styles.backgroundImage} fixed />

        <Text style={styles.title}>{certificateTitle}</Text>

        <View style={styles.content}>
          <View style={styles.officialsSection}>
            <Text style={styles.sangguniangBarangayText}>
            </Text>
            {brgyOfficials?.map((official, index) => (
              <View key={index} style={styles.officialItem}>
                <Text
                  style={
                    index === 0
                      ? styles.firstOfficialName
                      : styles.additionalOfficialName
                  }
                  hyphenationCallback={disableHyphenation}
                >
                  {official.full_name}
                </Text>
                <Text
                  style={
                    index === 0
                      ? styles.CaptainPosition
                      : styles.officialPosition
                  }
                  hyphenationCallback={disableHyphenation}
                >
                  {official.committee}
                </Text>
                {index === 0 && (
                  //<Text style={styles.mgaKagawadText}>MGA KAGAWAD:</Text>
                  <Text style={styles.mgaKagawadText}> </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.messageSection}>
            <Text style={styles.dateText} hyphenationCallback={disableHyphenation}></Text>
            <Text style={styles.messageText} hyphenationCallback={disableHyphenation}>
              {message.map((part, index) => (
                <Text
                  hyphenationCallback={disableHyphenation}
                  key={index}
                  style={
                    part.isBold
                      ? {
                          fontWeight: "bold",
                          fontFamily: "Times New Roman Bold",
                          fontSize: 11,
                        }
                      : {}
                  }
                >
                  {part.text.replace('\n\n', '\n\n        ')}
                </Text>
              ))}
            </Text>
          </View>
          <View style={styles.profilepic}>
            <Image src="/src/assets/uploads/user_profile/sample.jpg" fixed />
          </View>
          <View style={styles.reqsignature}>
            <Text>_____________________</Text>
            <Text>Requestor Signature</Text>
          </View>
          <View style={styles.esignature_img}>
            <Image src={"/src/assets" + brgyOfficials[0].e_signature} fixed />
          </View>
          <View style={styles.signature_bold}>
            <Text>{brgyOfficials[0].full_name}</Text>
            <Text style={styles.signature}>Punong Barangay</Text>
          </View>
          <View style={styles.controlnumber}>
            <Text style={styles.messageText}>CTRL.NO.: 2025-000001{}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificatePreview;
