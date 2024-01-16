import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { userRequest,shift } from '../../../App';
import { API_URL, userAuth } from '../../../app/context/AuthContext';
import axios from 'axios';
import { useRequests } from '../../../app/context/requestsContext';
import { useSnackbarContext } from '../../SnackbarProvider';

const FindReplacmentComp = ({ shift, handelFindReplace }) => {
    const [possibleUsers, setpossibleUsers] = useState<shift[]>();
    const {authState} = userAuth();
    const {addSnackBarToQueue} = useSnackbarContext();
    const requests = useRequests();
    useEffect(() => {
      const getPossibleuseres = async () => {
        const result = await handelFindReplace(shift);
        console.log(result);
        setpossibleUsers(result);
      };
      getPossibleuseres();
    }, [shift]);

    const handelAskReplace = async (requstedUser: number | undefined) => {
      console.log({ requstedUser }, { shift });
      if(requstedUser){
     if (authState?.authenticated){

    
      const requestDto :userRequest = {
        senderId: shift.userId,
        destionationUserId: requstedUser,
        isAnswered: false,
        requsetMsg: "",
        shiftId: shift.id,
        shiftStartTime:shift.shifttStartHour ,
        requestAnswerMsg:null,
        shiftEndTime:shift.shiftEndHour,
        senderName: authState?.user?.firstName,
        senderLastName: authState?.user?.lastName,
      };
    
      console.log({ requestDto });
        //call api to send the msg ?
      const respons = await requests.sendReq(requestDto);
        console.log("emit msg",respons);
        addSnackBarToQueue({snackbarMessage:'Messege sent.'})
      }
      //add update state after emit
    };
  }
    const replaceUserAsAdmin = async (newUser: number | undefined) => {
      console.log({ newUser });
      try {
        const response = await axios.post(`${API_URL}shifts/replaceUser`, {
          newUser,
          shift,
        });
        console.log(response);
      } catch (error) {
        console.log({ error });
      }
    };
    const replaceItem = (item: shift) => {
      return (
        <View style={{flex:1}}>
          <Text>
            {item.userRef?.firstName},{item.userRef?.lastName} ,
            {item.userRef?.id}
          </Text>
          <View>
            <Pressable onPress={() => handelAskReplace(item.userRef?.id)}>
              <Text>Ask to take replace.</Text>
            </Pressable>
            <Pressable onPress={() => replaceUserAsAdmin(item.userRef?.id)}>
              <Text>replace users as admin</Text>
            </Pressable>
          </View>
        </View>
      );
    };

    if (possibleUsers) {
      return (
        <View style={{ flex: 1 }}>
        {possibleUsers.map((item, index) => (
        <View key={'replace-' + item.id.toString()}>
          {replaceItem(item)}
        </View>
      ))}
      </View>
      );
    } else
      return (
        <View>
          <Text>no replace</Text>
        </View>
      );
  }
export default FindReplacmentComp

const styles = StyleSheet.create({})