import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Pressable,
} from "react-native";
import { TextInput } from "react-native-paper";
import { userAuth } from "../app/context/AuthContext";
import {mainStyle} from '../utils/mainStyles';


const LoginScreen = () => {
  const [userEmail, setuserEmail] = useState("");
  const [userPassword, setuserPassword] = useState("");
const {onLogin,onRegister} = userAuth();

  const onLoginPress =async () => {
    //This will send requst to server

    console.log("Press");
    const result = await onLogin!(userEmail,userPassword);
    console.log({result});
    if(result && result.error){
        alert(result.msg);
    }

  }; 
  const register =async () => {
    const result = await onRegister!(userEmail,userPassword);
    if(result && result.error){
        alert(result.msg);
    }
    else{
        onLoginPress();
    }
  }
  return (
    <SafeAreaView style={{flex:1, flexDirection:'row' , justifyContent:'space-around'}}>
      <View style={styles.mainBox}>
        <View style={{flex:1, marginBottom:'60%'}}>
          <Text style ={mainStyle.h1 }>Kamad scedualer login. </Text>
        </View>

        <View style={{flex:4}} >
          <TextInput
          style={{flex:1 , margin: 5, }}
          autoFocus={true}
            onChangeText={setuserEmail}
            value={userEmail}
            inputMode={"email"}
            placeholder="Email"
          />
          <TextInput
          style={{flex:1,margin:5}}
            onChangeText={setuserPassword}
            value={userPassword}
            secureTextEntry={true}
            placeholder="Password"
          />
          <View style={{ flexDirection:'row' , flex:5, justifyContent:'space-around'  , margin:10}}>
            <View style={{maxHeight:60 , flexDirection:'row', }}>
          <Pressable onPress={onLoginPress} style={[mainStyle.button, mainStyle.buttonClose,]}>
            <Text style={mainStyle.buttonText}>Log in </Text>
          </Pressable>
        <Pressable onPress={register}  style={[mainStyle.button, mainStyle.buttonClose]}>
            <Text style={mainStyle.buttonText}>register</Text>
          </Pressable>
        </View>
</View>
          </View>
                </View>
    </SafeAreaView>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
 mainBox:{
  flex:1,
  maxHeight:650,
  maxWidth: 350,
  width:300, 
minWidth:100, 
  
 }
 
  


})