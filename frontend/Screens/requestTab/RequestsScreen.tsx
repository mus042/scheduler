import { Pressable, StyleSheet,TouchableOpacity,View, } from "react-native";
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





const RequestsScreen = () => {
  //main screen for holding the userRequests 
  
  
  //////////////////////////////////////////
  //Context 
  ////////////////////////////////////
  const { authState }: any = userAuth();
  const { requests,updateStatus } = useRequests();
  /////////////////////////////////////////////
  // ////////////////////////////////////////
  /////////////////////////////////

  //incoming / sent
  const [selctedRequests,setSelctedRequests] = useState<'in'|'out'|'all'>('all')//Set what requests are selected - in / out
  const [showReq , setShoweReq] = useState<userRequest[] | []>();

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

},[requests]);

useEffect(()=>{

      console.log({showReq});

},[showReq])




  
  useEffect(() => {
    //set state incoming outgoing requests
    if (requests?.recived) {
      console.log({ requests }, requests?.recived);
      setIncomingRequests(requests.recived);
      for(const req of requests.recived){
        if(req.status !== 'seen' && req.status !== 'recived'){
          const tmpReq:userRequest = {id:req.id,status:req.status,senderId:req.senderId, destionationUserId:req.destionationUserId, isAnswered:req.isAnswered, shiftId:req.shiftId,requestAnswerMsg:req.requestAnswerMsg};
          tmpReq.status ='recived';
          updateStatus(tmpReq);
          
          // console.log('setSeen')
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
  const searchSelctedBox = (str:string)=>{
    //mount new selcted requests . 
    //try to fond seprators and return arr 
    
    const strArr= str.split(/[/.'"-]/); // sepreate seprators
    
     console.log({str},Number(str),{strArr});
     const containsDigit=(number, digit)=> {
      const numberString = number.toString();
      const digitString = digit.toString();
      return numberString.includes(digitString);
  }
    const selctedReq =[];

     if(str.length === 0){
       console.log({str})
      selcetReqToSee(selctedRequests)
     }
     else if(showReq) {
      //get numbers from str 
      const numbers = (str.match(/\d+/g) || []).map(Number);
      //check if numbers are date / id /time 
      const idMatch = [];
      const dateMatch =[]; 
      const timeMatch = [];
      const strMatch = []; 
      for(const request of showReq){
          let addFlag =false;
          //try create date if numbers length is 3
          console.log(numbers.length);
          if(numbers.length === 3){
            //try date 
            let tmpDate:Date = new Date(numbers[2],numbers[0],numbers[1]);
            console.log({tmpDate});
            //try set day/month/year
            if(tmpDate && tmpDate.getTime() === request.shift?.shiftStartHour.getTime()){
              dateMatch.push({...request});
            }
            else{
              tmpDate = new Date(numbers[2],numbers[1],numbers[2]);
              if(tmpDate && tmpDate.getTime() === request.shift?.shiftEndHour.getTime()){
                dateMatch.push({...request})
              }
            }
          }
        for(const num of numbers){
            if(!addFlag && request.shift?.id === num || !addFlag && containsDigit(request.shiftId,num)){//req id
              console.log("id")
              idMatch.push({...request});
              addFlag = true;
            }
            if(!addFlag && request.id === num|| !addFlag && containsDigit(request.id ,num)){//scheduale id
              idMatch.push(request);
              addFlag = true;
            }
            if(!addFlag && request.shift?.scheduleId === num|| !addFlag && containsDigit(request.shift?.scheduleId,num)){//scheduale id
              idMatch.push(request);
              addFlag = true;
            }
            let tmpDate = new Date();
            const tmpReq =request?.shift?.shiftStartHour && new Date(request.shift.shiftStartHour)
            console.log({tmpDate},{tmpReq})
            if( tmpDate && tmpReq){
              tmpDate.setDate(num);//try day of this month
              // console.log({tmpDate})
              if(tmpReq.getTime() === tmpDate.getTime()){
                dateMatch.push({...request})
              }else if(tmpReq.getTime() === tmpDate.getTime()){
                dateMatch.push(tmpReq.getTime() === tmpDate.getTime());
              }

            }
          }
      }
      const combinedArray = [...idMatch,];

      setShoweReq(combinedArray)
  };

  // const searchStrNormalized = normalizeSearchStr(str);

  }
 

  return (
    <View style={styles.mainContainer}>
      <View >
       <RequestsHeader onBoxSelect={selcetReqToSee} searchFunction={searchSelctedBox} />
       </View>
      {/* <RequestCompenent req={} /> */}
        
          {/* <Text>requests Scroll view </Text>
          <Text >In </Text> */}
          
         <FlatList
            data={showReq}
            renderItem={({ item }) => <RequestComponent req={item} setReqStatus={updateStatus}/>}
            keyExtractor={(item, index) => index.toString()}
          /> 
       <Pressable 
          onPress={() => console.log("press")}
         
        >
          <Text style={styles.text}>Out</Text>
        </Pressable>
  
    
      
  

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
