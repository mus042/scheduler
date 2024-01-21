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
import { mainStyle } from "../utils/mainStyles";
import { Button, TextInput, useTheme } from "react-native-paper";

const SignupScreen = ({ navigation }) => {
  //user details state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [validPass, setValidPass] = useState(false);
  const [userEmail, setuserEmail] = useState<string>("");
  const [userEmailValid, setUserEmailValid] = useState(false);
  const [userPassword, setuserPassword] = useState<string>("");
  const [reUserPassword, setReUserPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [facilityId, setfacilityId] = useState<number>(-1);
  const [facilityName, setFacilityName] = useState("");

  ////////////////
  //app context
  /////////////////

  const { onLogin, onRegisterOrg, onRegister } = userAuth();
  const [isValidForm, setIsValidForm] = useState(false);
  const theme = useTheme();

  const handleNavigateToLoginScreenOrg = () => {
    // Use the navigation.navigate function to navigate to "LoginScreenOrg"
    navigation.navigate("login facility");
  };
  const onLoginPress = async () => {
    //This will send requst to server
    console.log("Press");
    const result = await onLogin!(userEmail, userPassword);
    console.log({ result });
    if (result && result.error) {
      alert(result.msg);
    }
  };
  
  const register = async () => {
    console.log("on Register", { facilityId });
    const userProfile = {
      firstName:firstName,
      lastName: lastName,
      phoneNumber:phoneNumber,
    }
    if (facilityId) {
      console.log({ facilityId });
      
      const result = await onRegister!(userEmail, userPassword, facilityId,userProfile);
      console.log({ result });
      if (result && result.error) {
        alert(result.msg);
      } else {
        console.log("registerd");
        //To add await screen
        onLoginPress();
      }
    }
  };
  // Function to perform form validation
  const validateForm = () => {
    const isEmailValid = checkEmail(userEmail);
    const isPasswordValid = userPassword.length >= 4; // Minimum password length
    const isOrgValid = facilityId && facilityId >= 0; // Non-empty organization
    console.log(isEmailValid, isPasswordValid);
    return isEmailValid && isPasswordValid;
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
  // useEffect to validate form on changes to userEmail, userOrg, and userPassword
  useEffect(() => {
    const isFormValid = validateForm();
    setIsValidForm(!isFormValid);
  }, [userEmail, facilityId, userPassword]);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  ///////////
  // styles//
  ///////////
  const styles = StyleSheet.create({
    mainBox: {
      flex: 1,
      // maxHeight: 650,
      minWidth: 100,
    },
    inputBox: {
      backgroundColor: theme.colors.secondaryContainer,
      borderColor: theme.colors.onBackground,
      borderWidth: 2,
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      alignSelf: "center",
      width: 300,

      marginBottom: 10,
      maxHeight: 50,
    },
    underLine: {
      width: 240,
      marginLeft: 45,
    },
  });

  const handleNumberChange = (text: string) => {
    // Check if the input contains only numeric characters
    if (/^\d*$/.test(text)) {
      setfacilityId(Number(text));
    }
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <View style={styles.mainBox}>
        <View style={{ flex: 3 }}>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="First Name"
              dense
              value={firstName}
              underlineStyle={styles.underLine}
              onChangeText={(text) => setFirstName(text)}
              left={
                <TextInput.Icon
                  style={{ alignSelf: "center" }}
                  icon={"account-details-outline"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="Last Name"
              value={lastName}
              underlineStyle={styles.underLine}
              onChangeText={(text) => setLastName(text)}
              left={
                <TextInput.Icon
                  icon={"account-details-outline"}
                  style={{ alignSelf: "center" }}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="Email"
              value={userEmail}
              underlineStyle={styles.underLine}
              onChangeText={(text) => setuserEmail(text)}
              left={
                <TextInput.Icon
                  icon={"at"}
                  style={{ alignSelf: "center" }}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="Phone Number"
              value={phoneNumber}
              underlineStyle={styles.underLine}
              onChangeText={(text) => setPhoneNumber(text)}
              left={
                <TextInput.Icon
                  style={{ alignSelf: "center" }}
                  icon={"phone-settings"}
                  color={
                    userEmailValid
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              onChangeText={(input) => setPassword(input)}
              value={userPassword}
              underlineStyle={styles.underLine}
              label="Password"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  style={{ alignSelf: "center" }}
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={togglePasswordVisibility}
                />
              }
              left={
                <TextInput.Icon
                  style={{ alignSelf: "center" }}
                  icon={validPass ? "lock" : "lock-alert"}
                  color={
                    !validPass
                      ? theme.colors.onError
                      : theme.colors.onBackground
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              onChangeText={(input) => setReUserPassword(input)}
              value={reUserPassword}
              label="Re Password"
              underlineStyle={styles.underLine}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  style={{ alignSelf: "center" }}
                  onPress={togglePasswordVisibility}
                />
              }
              left={
                <TextInput.Icon
                  icon={validPass ? "lock" : "lock-alert"}
                  style={{ alignSelf: "center" }}
                  color={
                    validPass && reUserPassword === userPassword
                      ? theme.colors.onBackground
                      : theme.colors.onError
                  }
                />
              }
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <TextInput
              style={styles.inputBox}
              label="Facility ID"
              value={facilityId > -1 ? facilityId.toString() : ""}
              onChangeText={(text) => handleNumberChange(text)}
              underlineStyle={styles.underLine}
            />
          </View>
          <View style={{ flex: 1, alignSelf: "center", marginTop: 30 }}>
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
        {/* <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
            alignContent: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignContent: "flex-end",
              alignSelf: "flex-end",
              marginBottom: 15,
            }}
          >
            <Button
              onPress={handleNavigateToLoginScreenOrg}
              mode="text"
              disabled={false}
              textColor={theme.colors.onSecondary}
            >
              Sign Facility
            </Button>
            <Button
              onPress={register}
              mode="text"
              disabled={isValidForm}
              textColor={theme.colors.onSecondary}
            >
              Sign Up
            </Button>
          </View>
        </View> */}
      </View>
    </SafeAreaView>
  );
};
export default SignupScreen;
