import { StyleSheet, } from "react-native";
import React, { useEffect, useState } from "react";
import { mainStyle } from "../../utils/mainStyles";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { userAuth } from "../../app/context/AuthContext";

import { useRequests } from "../../app/context/requestsContext";
import RequestCompenent from "../DashBoardScreen/components/RequestMiniCompenent";
import RequestComponent from "./components/requestComponent";
import { userRequest } from "../../App";
import {View, Text, Colors, Drawer, Badge} from 'react-native-ui-lib';

import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import DrawerScreen from "./components/DrawerScreen";
const RequestsScreen = () => {
  //main screen for holding the userRequests
  //incoming / sent

  const [incomingRequest, setIncomingRequests] = useState<any[]>();
  const [sentReq, setSentReq] = useState<any>();
  const { authState }: any = userAuth();
  const { requests,setSeen } = useRequests();

  useEffect(() => {
    //set state incoming outgoing requests
    if (requests?.recived) {
      console.log({ requests }, requests?.recived);
      setIncomingRequests(requests.recived);
      for(const req of requests.recived){
        if(req.status !== 'seen'){
          const tmpReq:userRequest = {id:req.id,status:req.status,senderId:req.senderId, destionationUserId:req.destionationUserId, isAnswered:req.isAnswered, shiftId:req.shiftId};
          tmpReq.status ='seen';
          setSeen(tmpReq);
          console.log('setSeen')
        }
      }
    }
  }, [requests]);


  return (
    <View style={styles.mainContainer}>
      <Text black text50 >Requests</Text>
       {/* <DrawerScreen /> */}

      {requests?.recived && (
        <ScrollView>
          <Text>requests Scroll view </Text>
          <Text text50BO blue50>In </Text>
          <FlatList
            data={requests.recived}
            renderItem={({ item }) => <RequestComponent req={item} />}
            keyExtractor={(item, index) => index.toString()}
          />
           <Text text50BO blue50>In </Text>
          <FlatList
            data={requests.sent}
            renderItem={({item}) => <RequestComponent req={item} />}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      )}
      
  

    </View>
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  mainContainer:{
    flex:1,
    borderColor:'red',
    borderWidth:1,
    width:'90%'
  }
});
