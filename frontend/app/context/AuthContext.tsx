import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Text } from "react-native"; // Import the Text component

import * as storage from "./storage.native";
import jwtDecode from "jwt-decode";
import { user } from "../../App";
import { Socket, io } from "socket.io-client";
// import { useWebSocket } from "./WebSocketContext";
import { createStackNavigator } from "@react-navigation/stack";
import { useRequests } from "./requestsContext";
import { useSnackbarContext } from "../../Screens/SnackbarProvider";


interface AuthProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    user: user | null;
    socket: any | null;
    receivedRequests: any[];
    sentRequest: any[];
    requestArchive: any | null;
  };
  onRegister?: (
    email: string,
    password: string,
    faciityId: number,
    userProfile:{firstName:string,
    lastName:string,phoneNumber:string}
  
  ) => Promise<any>;
  onRegisterOrg?: (
    email: string,
    password: string,
    facilityName: string,
    userProfile:{firstName:string,
      lastName:string,phoneNumber:string}
  ) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "my-jwt";
export const API_URL = "http://127.0.0.1:3000/";
const AuthContext = createContext<AuthProps>({});

export const userAuth = () => {
  return useContext(AuthContext);
};

// Function to check if the token has expired
const isTokenExpired = (token: any) => {
  const decodedToken: any = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Convert to seconds
  return decodedToken.exp < currentTime;
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setauthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user: object | null;
    socket?: Socket |null;
  }>({ token: null, authenticated: null, user: null, socket: null });
  const {updateInRequests} = useRequests();
  const {addSnackBarToQueue} = useSnackbarContext();


  useEffect(() => {
    const loadToken = async () => {
      const token = await storage.getItem(TOKEN_KEY);
      console.log("stored: ", token);

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        if (isTokenExpired(token)) {
          // Token has expired, clear the token and redirect to login
          await storage.deleteItem(TOKEN_KEY);
          setauthState({
            token: null,
            authenticated: false,
            user: null,
            socket: null,
          });
        } else {
          const user = await getUser();
          const socketInstance = io(`${API_URL}events`, {
            auth: (cb: any) => {
              cb({ token: token });
            },
          });console.log({socketInstance})
         

          console.log("log 71 authstate ", user, typeof user, { authState });
          setauthState({
            token: token,
            authenticated: true,
            user: user,
            socket: socketInstance,
          });

          const expirationTime = jwtDecode<{ exp: number }>(token).exp;
          const currentTime = Math.floor(Date.now() / 1000);
          const timeout = expirationTime - currentTime;

          setTimeout(() => {
            logOut();
          }, timeout * 1000); // Convert timeout from seconds to milliseconds
        }
      }
    };

    loadToken();
  }, []);

  ////////////////////////////////////////////////
  //Register new user 
/////////////////////////////////////////////////
  const register = async (
    email: string,
    password: string,
    facilityId:number,
    userProfile:{firstName:string,
      lastName:string,phoneNumber:string}
   
  ) => {
    try {
      return await axios.post(`${API_URL}auth/signup`, {
        email,
        password,
        facilityId,
        userProfile,
      });
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };
  const registerOrg = async (
    email: string,
    password: string,
    facilityName: string,
    userProfile:{firstName:string,
      lastName:string,phoneNumber:string}
  ) => {
    console.log("on register org");
    try {
  const res = await axios.post(`${API_URL}auth/signupOrg`, {
    email: email,
    password: password,
    name: facilityName,
    userProfile: {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phoneNumber: userProfile.phoneNumber, // Assuming phoneNumber is a field in userProfile
  },

});
      console.log({ res });
      return res;
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const getUser = async () => {
    console.log("get user ");
    const result = await axios.get(`${API_URL}users/me`);
    console.log({result})
    return result.data;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await axios.post(`${API_URL}auth/Signin`,{
        email,
        password,
      });
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${result.data.acsess_token}`;
      console.log(
        "authContext:40 - login - result ",
        result,
        result.data.acsess_token
      );
      console.log("signin");
      const user = await getUser();
      const socketInstance = io(`${API_URL}events`, {
        auth: (cb: any) => {
          cb({ token: result.data.acsess_token });
        },
      });

      setauthState({
        token: result.data.acsess_token,
        authenticated: true,
        user: user,
        socket: socketInstance,
      });

      await storage.setItem(TOKEN_KEY, result.data.acsess_token);

      return result;
    } catch (error: any) {
      // console.log("error ",{error},error.data);
      if (error && axios.isAxiosError(error)) {
        console.log("error ",{error},error.response?.data.message);
        addSnackBarToQueue({snackbarMessage:error.response?.data.message})
        console.log(error.response?.data.message)
      }
    }
  };

  const logOut = async () => {
    console.log("logout");
    try {
      await storage.deleteItem(TOKEN_KEY);

      axios.defaults.headers.common["Authorization"] = "";
      authState.socket?.disconnect();
      setauthState({
        token: "",
        authenticated: false,
        user: null,
        socket: authState.socket,
      });
      console.log({ authState });
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const value = {
    onRegister: register,
    onRegisterOrg: registerOrg,
    onLogin: signIn,
    onLogout: logOut,
    authState: authState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
