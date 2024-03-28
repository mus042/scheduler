import { Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import UserItem from './UserItem'
import { useTheme } from 'react-native-paper/src/core/theming';
import { IconButton, MD3Colors, RadioButton, TextInput } from 'react-native-paper';
import { mainStyle } from '../../utils/mainStyles';
import { user } from '../../App';
import UserDetailsComp from './UserDetailsComp';

const UsersPanel = ({users,editUser,roles,addUser }) => {
    const[selctedUser,setSelectedUser] = useState();
    
    console.log({roles})
    const theme  = useTheme();

    const onPressAddUser = () => { 
       console.log("add user");
       const newUser :user ={id:-1, userServerRole:"user", userLevel:0,typeOfUser:'new', email:'',userProfile:{firstName:'new user', lastName:'new'}}
       setSelectedUser(newUser);
    }
   
  return (
    <View style={{flex:1,minHeight:500}}>
      <View style={{flex:1}}>
    <Text >UsersPanel</Text>
    </View>
    <View>
      <Text>
        user stats - shift manager total , guard total 
      </Text>
      <View>
        {/* users statistics  */}
      </View>
      </View>
    <View style={{flex:2,flexDirection:'column',minHeight:75,}}>
   { users &&   <FlatList
          horizontal={true}
            data={[...users,{id:'addUserButton'}]}
            renderItem={( {item} ) => {
              console.log({item})
              if (item.id === 'addUserButton') {
                return (
                
                    <View style={{alignItems:'center'}}>
                    <IconButton
																		icon='plus'
																		iconColor={MD3Colors.error50}
																		size={55}
																		onPress={() => onPressAddUser()}
																	/>
                     <Pressable onPress={() => onPressAddUser()}>
                      <Text>Add User</Text>  
                      </Pressable>
                    </View>
                 
                );
              }else{

                return <UserItem item={item} setselectUser={setSelectedUser} />;
              }

            }}
            keyExtractor={(item) => item.id}
          />}
          </View>
          <View style={{flex:9,minHeight:300,}}>
            
            {selctedUser && <UserDetailsComp user={selctedUser} onSubmit={selctedUser.id === -1?addUser:editUser} isEdit={true} roles={roles} /> }
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