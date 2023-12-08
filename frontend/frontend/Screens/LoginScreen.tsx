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
  const [userPassword, setuserPassword] = useState("");
  const [facilityId, setfacilityId] = useState<number>();
  const { onLogin, onRegister } = userAuth();
  const [isValidForm, setIsValidForm] = useState(true);
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
    if (facilityId) {
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
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail); // Basic email validation
    const isPasswordValid = userPassword.length >= 4; // Minimum password length
    const isOrgValid = facilityId && facilityId >= 0; // Non-empty organization
    console.log(isEmailValid, isPasswordValid);
    return isEmailValid && isPasswordValid;
  };
  // useEffect to validate form on changes to userEmail, userOrg, and userPassword
  useEffect(() => {
    const isFormValid = validateForm();
    setIsValidForm(!isFormValid);
  }, [userEmail, facilityId, userPassword]);
  const styles = StyleSheet.create({
    mainBox: {
      flex: 1,
      maxHeight: 650,
      maxWidth: 350,
      width: 500,
      minWidth: 100,
    },
    inputBox: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.onBackground,
      borderBottomWidth: 1,
      alignSelf: "center",
      width: 350,
      justifyContent: "center",
      marginTop: 4,
    },
  });
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      <View style={styles.mainBox}>
        <View style={{ flex: 1 }}>
          <Text>Kamad scedualer login. </Text>
        </View>

        <View style={{ flex: 4 }}>
          <TextInput
            style={styles.inputBox}
            label="Email"
            value={userEmail}
            onChangeText={(text) => setuserEmail(text)}
          />
          <TextInput
            style={styles.inputBox}
            onChangeText={(input) => setuserPassword(input)}
            value={userPassword}
            secureTextEntry={true}
            label="Password"
          />
          {/* <TextInput
        style={styles.inputBox}
            onChangeText={(input)=>setfacilityId(+input)}
            value={facilityId ? String(facilityId) : ''}
            
            label="Facility ID"
            
          /> */}

          <View style={{flex:1}}>
            <View style={{ flexDirection: "row" }}>
              <Button onPress={register} disabled={isValidForm}>
                {" "}
                Sign Up
              </Button>
              <Button onPress={onLoginPress} disabled={isValidForm}>
                Sign In{" "}
              </Button>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{ borderColor: "red", borderWidth: 1, alignSelf: "flex-end" }}
      >
        <Button onPress={handleNavigateToLoginScreenOrg} disabled={false}>
          Sign Facility{" "}
        </Button>
      </View>
    </SafeAreaView>
  );
};
export default LoginScreen;
