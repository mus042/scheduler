import { Button, FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import UserItem from './UserItem'
import { useTheme } from 'react-native-paper/src/core/theming';
import { RadioButton, TextInput } from 'react-native-paper';
import { mainStyle } from '../../utils/mainStyles';
import { user } from '../../App';
import UserDetailsComp from './UserDetailsComp';

const UsersPanel = ({users,editUser,roles }) => {
    const[selctedUser,setSelectedUser] = useState();
    console.log({roles})
    const theme  = useTheme();

   
  return (
    <View style={{flex:1,minHeight:500}}>
      <View style={{flex:1}}>
    <Text >UsersPanel</Text>
    </View>
    <View style={{flex:3,flexDirection:'column',minHeight:70,alignItems:'center'}}>
      <FlatList
          horizontal={true}
            data={users}
            renderItem={(item) => (
              <UserItem item={item} setselectUser={setSelectedUser} />
            )}
            keyExtractor={(item) => item.id}
          />
          </View>
          <View style={{flex:4,minHeight:300,}}>
            
            {selctedUser && <UserDetailsComp user={selctedUser} onSubmit={editUser} isEdit={true} roles={roles} /> }
          </View>
    </View>
  )
}

export default UsersPanel

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems:'center',
        minWidth:20,
        minHeight:100,
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