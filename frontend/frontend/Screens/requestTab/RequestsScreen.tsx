import { StyleSheet,TouchableOpacity,View, } from "react-native";
import React, { useEffect, useState } from "react";
import { mainStyle } from "../../utils/mainStyles";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { userAuth } from "../../app/context/AuthContext";

import { useRequests } from "../../app/context/requestsContext";
import RequestCompenent from "../DashBoardScreen/components/RequestMiniCompenent";
import RequestComponent from "./components/requestComponent";
import { userRequest } from "../../App";


import { Appbar , Text} from 'react-native-paper';

import DrawerScreen from "./components/DrawerScreen";
import MyComponent from "./RequestHeader";
import RequestsHeader from "./RequestHeader";


const MusicRoute = () => <Text>Music</Text>;

const AlbumsRoute = () => <Text>Albums</Text>;

const RecentsRoute = () => <Text>Recents</Text>;

const NotificationsRoute = () => <Text>Notifications</Text>;




const RequestsScreen = () => {
  //main screen for holding the userRequests 
  
  
  //////////////////////////////////////////
  //Context 
  ////////////////////////////////////
  const { authState }: any = userAuth();
  const { requests,setSeen } = useRequests();
  /////////////////////////////////////////////
  // ////////////////////////////////////////
  /////////////////////////////////

  //incoming / sent
  const [selctedRequests,setSelctedRequests] = useState<'in'|'out'>('in')//Set what requests are selected - in / out
  const [showReq , setShoweReq] = useState<userRequest[]>();

  const [incomingRequest, setIncomingRequests] = useState<any[]>();
  const [sentReq, setSentReq] = useState<any[]>();
  
  


useEffect(()=>{

  const setAllRequsets = ()=>{
    if(Array.isArray(requests?.recived) && Array.isArray(requests.sent)){
    const allReq = [...requests.recived,...requests.sent];
      setShoweReq(allReq);
      console.log({allReq});
    }
} 
setAllRequsets();

},[requests])




  
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
    if(requests?.sent){
      setSentReq(requests.sent);
    };


  }, [requests]);

  const selcetReqToSee =(selctedBox:"in"|"out")=>{
    //Select shifts , from inbox / outbox 
    if(selctedBox ==='in'){
      setShoweReq(incomingRequest);
    }else{
      setShoweReq(sentReq);
    }
  }

 

  return (
    <View style={styles.mainContainer}>
       <RequestsHeader onBoxSelect={selcetReqToSee} />
      {/* <Text  >Requests</Text> */}
       {/* <DrawerScreen /> */}

      {/* <RequestCompenent req={} /> */}
        <ScrollView style={{flex:1,borderColor:'green',borderWidth:5}}>
          {/* <Text>requests Scroll view </Text>
          <Text >In </Text> */}
          <View style={{flex:1 , minHeight:300, borderColor:"pink", borderWidth:3,}}>
         <FlatList
            data={showReq}
            renderItem={({ item }) => <RequestComponent req={item} />}
            keyExtractor={(item, index) => index.toString()}
          /> 
         </View>
        </ScrollView>
    
      
  

    </View>
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  mainContainer:{
    flex:1,
    width:'100%',
  }
});
