import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  Pressable,
  View,
} from "react-native";

import { userAuth } from "../app/context/AuthContext";
import {mainStyle} from '../utils/mainStyles';
import { Button ,TextInput } from 'react-native-paper';

const LoginScreen = ({navigation}) => {
  const [userEmail, setuserEmail] = useState("");
  const [userPassword, setuserPassword] = useState("");
  const [facilityId, setfacilityId] = useState<number>();
const {onLogin,onRegister} = userAuth();
const [isValidForm, setIsValidForm] = useState(true);

const handleNavigateToLoginScreenOrg = () => {
  // Use the navigation.navigate function to navigate to "LoginScreenOrg"
  navigation.navigate('login facility');
};
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
   if(facilityId){
    const result = await onRegister!(userEmail,userPassword,facilityId);
    if(result && result.error){
        alert(result.msg);
    }}
    else{
        onLoginPress();
    }
  }
// Function to perform form validation
const validateForm = () => {
  
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail); // Basic email validation
  const isPasswordValid = userPassword.length >= 4; // Minimum password length
  const isOrgValid = facilityId && facilityId >= 0; // Non-empty organization
console.log(isEmailValid , isPasswordValid )
  return isEmailValid && isPasswordValid ;
};
// useEffect to validate form on changes to userEmail, userOrg, and userPassword
useEffect(() => {
  const isFormValid = validateForm();
  setIsValidForm(!isFormValid);
}, [userEmail, facilityId, userPassword]);
  
  return (
    <SafeAreaView style={{flex:1, flexDirection:'row' , justifyContent:'space-around'}}>
      <View style={styles.mainBox}>
        <View style={{flex:1, marginBottom:'60%'}}>
          <Text>Kamad scedualer login. </Text>
        </View>

        <View style={{flex:4}} >
        <TextInput
      label="Email"
      value={userEmail}
      onChangeText={text => setuserEmail(text)}
    />      
        <TextInput
            onChangeText={(input)=>setuserPassword(input)}
            value={userPassword}
            secureTextEntry={true}
            label="Password"
           
          />
        <TextInput
            onChangeText={(input)=>setfacilityId(+input)}
            value={facilityId ? String(facilityId) : ''}
            
            label="Facility ID"
           
          />
 
          <View >
            <View>
          <Button onPress={register} disabled={isValidForm}> Sign Up</Button>
          <Button onPress={onLoginPress} disabled={isValidForm} >Sign In </Button>
          </View>
          <View  >  
          <Button  onPress={handleNavigateToLoginScreenOrg} disabled={false} >Sign Facility </Button>
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