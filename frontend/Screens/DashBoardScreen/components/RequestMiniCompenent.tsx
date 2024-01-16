import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRequests } from "../../../app/context/requestsContext";
import { useWebSocket } from "../../../app/context/WebSocketContext";
import { Socket } from "socket.io-client";
import { userAuth } from "../../../app/context/AuthContext";
import UserStats from "./UserStats";
import { userRequest } from "../../../App";
import { Avatar } from "react-native-paper";

const RequestComponent = () => {
  const {authState}  = userAuth();
  const {requests} = useRequests();
  const [recivedReq, setRecivedReq] = useState<userRequest[] | null >([]);
  const [isNewReq,setIsNewReq] = useState<boolean>(false);

useEffect(() => {
  console.log({requests})
  //Set reviced request 
  requests?.recived && setRecivedReq(requests.recived)
  console.log({requests}, recivedReq);
  if(requests?.recived){
    for(const req of requests.recived){
      if(req.status !== 'recived'){
          console.log('unseen');
            setIsNewReq(true);
      }
    }
  }
}, [requests])

console.log('requests in comp',{requests});
  return (
    <View >
      <Pressable style={{alignItems:'flex-end',alignSelf:'center'}} onPress={() => console.log("press on request model")}>
      <Avatar.Icon size={24} icon="bell" style={{margin:3,marginRight:5}} />
        
      
        {/* {authState?.socket && <Text>{authState.socket?.id}</Text>} */}
        <View style={[{flex:1, flexDirection:'row',},isNewReq?{backgroundColor:'red'}:{}]}>
          <View style={{flex:1}}>
            {/* <Text>Sent{requests?.sent?.length}</Text> */}
          </View>
          <View style={{flex:1}}>
             {/* <Text>Recived: {requests?.recived?.length}  </Text> */}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default RequestComponent;

const styles = StyleSheet.create({});
