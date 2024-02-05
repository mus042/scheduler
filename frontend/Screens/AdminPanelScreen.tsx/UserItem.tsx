import { Button, Pressable, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { TextInput ,Text,List, Card, Avatar, useTheme } from 'react-native-paper';
import { mainStyle } from '../../utils/mainStyles';
import axios from 'axios';
import { API_URL } from '../../app/context/AuthContext';
import { normalizeShiftDate } from '../../utils/utils';

const UserItem = ({ item, setselectUser }) => {
    const [expanded, setExpanded] = React.useState(true);
    console.log({item})
    const user=item?.item;
  const handlePress = () => setExpanded(!expanded);
    const theme= useTheme();
    const editUser = async (
        email: string,
        userId: number,
        firstName: string,
        lastName: string
      ) => {
        //To change backend object dto
        try {
          console.log({ userId }, email, firstName);
          const dto = {
            email: email,
            firstName: firstName,
            lastName: lastName,
          };
    
          console.log({ dto });
          return await axios.post(`${API_URL}users/editUserAsAdmin/`, {
            userId: userId,
            dto: dto,
          });
        } catch (error) {
          return { error: true, msg: (error as any).response.data.msg };
        }
      };
   
   
   
      const label = ''+ item?.item?.userProfile?.lastName?.at(0)+item?.item?.userProfile?.firstName?.at(0)
      const onSelcetUser =(user)=>{
        console.log({user})
        setselectUser(user)
      }
    
  return (
    <View style={styles.container}> 
    <Pressable style={{flex:1,flexWrap:"wrap",minHeight:40}} onPress={()=>onSelcetUser(item.item)} onLongPress={()=>{}}>
  <View style={{flex:1,marginTop:10}}>
            <Avatar.Text
          label={label}
         size={50}
            
          />
          </View>
      
                <Text variant='titleMedium' style={{flexShrink:1}} >
                {item?.item?.userProfile?.firstName.substring(0, 7)}
                </Text>
  
    </Pressable>

    </View>
  )
}

export default UserItem

const styles = StyleSheet.create({
    
    
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems:'center',
        paddingHorizontal: 16,
        minWidth:20,
        maxWidth:80,
        
        height:100,
        borderColor:'red',
    borderWidth:3,
      },
      input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
      },
})