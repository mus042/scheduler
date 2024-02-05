import { StyleSheet,  View } from 'react-native'
import React, { useState } from 'react'

import { ActivityIndicator, Avatar, Button, Card, IconButton, MD2Colors, MD3Colors, Text } from "react-native-paper";
import { normalizeShiftTime } from '../../../utils/utils';
import FindReplacmentComp from './FindReplacmentComp';

const CardContent = ({name,shift,user,handelAskReplace})=>{
    const[findReplaceVisible,setfindReplaceVisible] = useState(false);
   
    


    //To Add shift roles map 
    const AssigndComp = ()=>{
console.log(shift.shiftRoles)
        return(
         <View>
           {shift.shiftRoles && shift.shiftRoles.map((shiftRole,index)=> (
            <View key={index}>
            <View>
          
              <Text variant="labelLarge">
                {shiftRole.role.name} Assiged: {shiftRole.user?.userProfile?.lastName}{", "}
                {shiftRole.user?.userProfile?.firstName}
              </Text>
            </View>
            {(user?.id === shift?.userId ||
              user?.userRole === "admin") && (
              <View style={{flexDirection:'row',minHeight:10,maxHeight:20}}>
                <Button
                  compact={true}
                  labelStyle={{margin:1,paddingRight:4}}
                  onPress={() => setfindReplaceVisible(!findReplaceVisible)}
                  icon="find-replace" mode="outlined"
                >
                 find replacment 
                </Button>
                {findReplaceVisible && (
                  <FindReplacmentComp
                    shift={shift}
                    handelFindReplace={handelAskReplace}
                  />
                )}
                {
                user?.userRole === "admin" && (
                    <IconButton icon="circle-edit-outline"
                    iconColor={MD3Colors.error50}
                    size={20}
                    style={{margin:0,padding:0,alignSelf:'center',}}
    
                    onPress={() => console.log('Pressed')} />
                )
                }
                
              </View>
            )}
            </View>
           ))}
          
        </View>
        )
    }
   
    return(
      <>
      <View
      style={{
        borderBottomColor: "black",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent:'space-between',
      }}
    >
      <Text variant="titleMedium" style={{ textAlign: "center" }}>
        {name},
      </Text>
      <Text variant="labelLarge" style={{ textAlign:"center",alignItems:'flex-end',alignSelf:'flex-end', }}>
        {normalizeShiftTime(shift.shiftStartHour)} -{" "}
        {normalizeShiftTime(shift.shiftEndHour)}
      </Text>
    </View>
    <View>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          width: 200,
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
       <AssigndComp />


      </View>
    </View>
    </>
    )
  }

export default CardContent

const styles = StyleSheet.create({})