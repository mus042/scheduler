import {
 StyleSheet,
  } from "react-native";


export const mainStyle = StyleSheet.create({
    mainBox:{
     flex:1,
     maxWidth: 600,
    },
    button: {
        borderRadius: 20,
        padding: 2,
        margin:5,
        elevation: 2,
        
      },
      buttonOpen: {
        backgroundColor: "#F194FF",
      },
      buttonClose: {
        backgroundColor: "#2196F3",
      },
     buttonText:{
        fontSize:25,
        padding:3,
        paddingBottom:3,
        marginBottom:10,
     },
     h1:{
        fontSize:40,
        fontWeight:"700",
     },
     h2:{
        fontSize:32,
        fontWeight:"600",
     },
     h3:{
        fontSize:28,
        fontWeight:"500",
     },
     h4:{
        fontSize:24,
        fontWeight:"500",
     },
     h5:{
        fontSize:18,
        fontWeight:"500",
     },
     text:{
        fontSize:16,
        fontWeight:"400",
     },
     centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
   
   })