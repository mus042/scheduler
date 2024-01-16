import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Avatar, useTheme } from "react-native-paper";

const RequestMassege = ({ position, avatar, text }) => {
  // posion will detarmin if to return style = right or left oriantaion

  const theme = useTheme();

  const styles =
    position === "right"
      ? StyleSheet.create({
          viewBox: {
            flexDirection: "row",
            margin: 3,
            marginBottom: 5,
            borderRadius: 10,
            padding: 1,
            alignSelf: "flex-start",
            maxWidth: 240,
            width:200,
            //   borderBottomWidth:1,
            backgroundColor: theme.colors.onPrimaryContainer,
          },
          textBox: {
            //   alignItems: "flex-end",
            flex: 4,
            alignContent:'center',
            alignItems:'baseline',
            flexDirection: "row",
            flexWrap: "wrap",
            alignSelf: "center",

          },
          iconBox: { flex: 1, margin: 1, padding: 1 },
          text: {
            textAlign: "left",
            
            color:theme.colors.onPrimary,
            margin:3,
          },
        })
      : StyleSheet.create({
          viewBox: {
            flexDirection: "row-reverse",
            margin: 3,
            marginBottom: 5,
            padding: 1,
            alignSelf: "flex-end",
            borderRadius: 10,
            backgroundColor: theme.colors.onBackground,
            maxWidth: 240,
            width:150,
            borderColor:'green',
            borderWidth:2,
          },
          textBox: {
          
            flex: 4,
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent:'flex-start',
            alignItems:'baseline',
            alignSelf:'flex-end'
           
          },
          iconBox: { flex: 1, margin: 1, padding: 1,alignSelf:'flex-start'  },

          text: {
            textAlign: "left",
            marginRight:10,
            margin:3,
            maxWidth: 240,
            
            
            color: theme.colors.background,
            
          },
        });

  return (
    <View style={styles.viewBox}>
      <View style={styles.iconBox}>{avatar}</View>
      <View style={styles.textBox}>
        <Text style={styles.text}>{text ? text : ""}</Text>
      </View>
    </View>
  );
};

export default RequestMassege;
