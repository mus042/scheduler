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

const LoginScreen = ({ navigation }) => {
  const [userEmail, setuserEmail] = useState("");
  const [userEmailValid, setUserEmailValid] = useState(false);
  const [userPassword, setuserPassword] = useState("");
  const [facilityId, setfacilityId] = useState<number>();
  const { onLogin, onRegister } = userAuth();
  const [isValidForm, setIsValidForm] = useState(true);
  const [validPass, setValidPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    console.log("on Register");
    if (facilityId) {
      console.log({ facilityId });
      const result = await onRegister!(userEmail, userPassword, facilityId);
      if (result && result.error) {
        alert(result.msg);
      }
    } else {
      onLoginPress();
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
      width: 350,
      marginBottom: 10,
      maxHeight: 50,
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
      <View style={styles.mainBox}>
        <View style={{ flex: 3, flexDirection: "row" }}>
          <View
            style={{ flex: 1, alignSelf: "flex-end", alignItems: "center" }}
          >
            <View style={{ flex: 1, margin: 10 }}>
              <TextInput
                style={[styles.inputBox, { alignItems: "center" }]}
                label="Email"
                value={userEmail}
                onChangeText={(text) => setuserEmail(text)}
                underlineStyle={{ width: 300, marginLeft: 25 }}
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
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.inputBox]}
                onChangeText={(input) => setPassword(input)}
                value={userPassword}
                label="Password"
                secureTextEntry={!showPassword}
                underlineStyle={{ width: 300, marginLeft: 25 }}
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
            </View>
            <View style={{ flex: 1, margin: 5, marginTop: 30 }}>
              <View
                style={{ alignSelf: "center", justifyContent: "space-between" }}
              >
                <Button
                  onPress={onLoginPress}
                  mode="elevated"
                  disabled={isValidForm}
                  icon="login"
                  // style={{ borderRadius: 0 }}
                  contentStyle={{ flexDirection: "row-reverse", width: 350 }}
                  labelStyle={{ fontSize: 20, marginLeft: 3, padding: 2 }}
                  textColor={theme.colors.onPrimary}
                  buttonColor={theme.colors.primary}
                >
                  Sign In
                </Button>
              </View>
            </View>
          </View>
        </View>
        <View
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
              textColor={theme.colors.onBackground}
            >
              Sign Facility
            </Button>
            <Button
              onPress={() => navigation.navigate("Signup")}
              mode="text"
              textColor={theme.colors.onBackground}
            >
              Sign Up
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default LoginScreen;
