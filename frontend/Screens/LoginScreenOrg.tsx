import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  Pressable,
  View,
  ImageBackground,
} from "react-native";

import { userAuth } from "../app/context/AuthContext";
import { mainStyle } from "../utils/mainStyles";
import { Button, TextInput, useTheme } from "react-native-paper";

const LoginScreenOrg = () => {
  //user details state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [validPass, setValidPass] = useState(false);
  const [userEmail, setuserEmail] = useState("");
  const [userEmailValid, setUserEmailValid] = useState(false);
  const [userPassword, setuserPassword] = useState("");
  const [reUserPassword, setReUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string>("");
  const [facilityName, setFacilityName] = useState("");
  const { onLogin, onRegisterOrg } = userAuth();
  const [isValidForm, setIsValidForm] = useState(false);

  
 
  //Context
  const theme = useTheme();
  const backgroundSource = theme.dark ? require('../assets/sky2.jpeg') :require('../assets/sky3.jpeg')
 
  useEffect(() => {
    const isFormValid = validateForm();
    setIsValidForm(isFormValid);
  }, [
    userEmail,
    facilityName,
    userPassword,
      firstName,
      lastName,
    reUserPassword,
  ]);

  const onLoginPress = async () => {
    //This will send requst to server

    console.log("Press");
    const result = await onLogin!(userEmail, userPassword);
    console.log({ result });
    if (result && result.error) {
      alert(result.msg);
    }
  };
  const setPassword = (input) => {
    setValidPass(input.length >= 4 ? true : false);
    console.log("valid");
    setuserPassword(input);
  };
  const checkEmail = (userEmail) => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    setUserEmailValid(isEmailValid);
    return isEmailValid;
  };
  const register = async () => {
    const userProfile = {
      firstName:firstName,
      lastName: lastName,
      phoneNumber:phoneNumber,
    }
    const result = await onRegisterOrg!(userEmail, userPassword, facilityName,userProfile);
    
    if (result && result.error) {
      alert(result.msg);
    } else {
      onLoginPress();
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //form validation
  const validateForm = () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/.test(
      userEmail
    ); // Basic email validation
    const isPasswordValid = userPassword.length >= 4;
    const reMatchPass = reUserPassword === userPassword;
    const isOrgValid = facilityName.trim() !== "";
    const isNameValid = firstName.trim() !== "" && lastName.trim() !== "";
    const phoneValid = phoneNumber.length === 10;

    console.log(isEmailValid, isPasswordValid, isOrgValid, isNameValid, {
      isNameValid,
    });
    return (
      isEmailValid &&
      reMatchPass &&
      isPasswordValid &&
      isOrgValid &&
      isNameValid &&
      phoneValid
    );
  };
  // useEffect to validate form on changes to userEmail, userOrg, and userPassword
  useEffect(() => {
    const isFormValid = validateForm();
    setIsValidForm(!isFormValid);
  }, [userEmail, facilityName, userPassword]);
  //Local Style
  const styles = StyleSheet.create({
    mainBox: {
      flex: 1,
      maxHeight: 600,
      minWidth: 100,
    },
    inputBox: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.onBackground,
      borderBottomWidth: 1,
      alignSelf: "center",
      width: 350,

      marginTop: 4,
    },
  });
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        justifyContent: "center",
      }}
    >
           <ImageBackground
      source={backgroundSource }
      style={{
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center', 
      }}
    >
      <View style={styles.mainBox}>
        <View style={{ flex: 4, flexDirection: "row" }}>
        <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="First Name"
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
              left={
                <TextInput.Icon
                  icon={"account-details-outline"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              label="Last Name"
              value={lastName}
              onChangeText={(text) => setLastName(text)}
              left={
                <TextInput.Icon
                  icon={"account-details-outline"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              label="Email"
              value={userEmail}
              onChangeText={(text) => setuserEmail(text)}
              left={
                <TextInput.Icon
                  icon={"at"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              left={
                <TextInput.Icon
                  icon={"phone-settings"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              onChangeText={(input) => setPassword(input)}
              value={userPassword}
              label="Password"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={togglePasswordVisibility}
                />
              }
              left={
                <TextInput.Icon
                  icon={validPass ? "lock" : "lock-alert"}
                  color={
                    !validPass
                      ? theme.colors.onError
                      : theme.colors.onBackground
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              onChangeText={(input) => setReUserPassword(input)}
              value={reUserPassword}
              label="Re Password"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={togglePasswordVisibility}
                />
              }
              left={
                <TextInput.Icon
                  icon={validPass ? "lock" : "lock-alert"}
                  color={
                    validPass && reUserPassword === userPassword
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />

            <TextInput
              style={styles.inputBox}
              label="Facility Name"
              value={facilityName}
              onChangeText={(text) => setFacilityName(text)}
              left={
                <TextInput.Icon
                  icon={"account-details-outline"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
            <TextInput
              style={styles.inputBox}
              label="Token"
              value={token}
              onChangeText={(text) => setToken(text)}
            />
            <View style={{ flex: 1, margin: 5, marginTop: 30 }}>
              <View
                style={{ alignSelf: "center", justifyContent: "space-between" }}
              >
                   <Button
              onPress={register}
              mode="elevated"
              disabled={isValidForm}
              icon="login"
              style={{ borderRadius: 0 }}
              contentStyle={{ flexDirection: "row-reverse", width: 350 }}
              labelStyle={{ fontSize: 20, marginLeft: 3, padding: 2 }}
              textColor={theme.colors.onBackground}
              buttonColor={theme.colors.inversePrimary}
            >
              Sign Up
            </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};
export default LoginScreenOrg;
