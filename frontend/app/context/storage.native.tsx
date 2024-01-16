import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, StyleSheet} from 'react-native';


const platform = Platform.OS;


export function getItem(key:string) {
  return platform === 'web'? AsyncStorage.getItem(key):SecureStore.getItemAsync(key);
};

 export function setItem(key:string,data:string){
  return platform === 'web'? AsyncStorage.setItem(key,data) : SecureStore.setItemAsync(key,data);
};
export function deleteItem(key:string){
  return platform === 'web' ? AsyncStorage.removeItem(key):SecureStore.deleteItemAsync(key);
}


