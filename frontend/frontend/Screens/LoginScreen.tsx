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

const LoginScreen = () => {
  const [userEmail, setuserEmail] = useState("");
  const [userPassword, setuserPassword] = useState("");
const {onLogin,onRegister} = userAuth();

  const onLoginPress =async () => {
    //This will send requst to server

    const result = await onLogin!(userEmail,userPassword);
    if(result && result.error){
        alert(result.msg);
    }

    console.log("Press");
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
      <View style={{flex:1}}>
        <View style={{flex:1}}>
          <Text>Login</Text>
        </View>

        <View style={{flex:8}} >
          <TextInput
          style={{flex:1}}
          autoFocus={true}
            onChangeText={setuserEmail}
            value={userEmail}
            inputMode={"email"}
            placeholder="Email"
          />
          <TextInput
          style={{flex:1}}
            onChangeText={setuserPassword}
            value={userPassword}
            secureTextEntry={true}
            placeholder="Password"
          />
          <View style={{flex:4}}>
          <Pressable onPress={onLoginPress} style={{flex:1,minHeight:100}}>
            <Text style={{flex:1}}>I'm pressable!</Text>
          </Pressable>
        <Pressable onPress={register}  style={{flex:1,minHeight:150}}>
            <Text>register</Text>
          </Pressable>
        </View>

          </View>
                </View>
    </SafeAreaView>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
 
  


})