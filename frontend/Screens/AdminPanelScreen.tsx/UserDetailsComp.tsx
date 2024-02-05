import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RadioButton, TextInput } from 'react-native-paper';
import { mainStyle } from '../../utils/mainStyles';

const UserDetailsComp=({user, onSubmit, isEdit,roles}) =>{
    const [email, setEmail] = useState(user?.email );
    const [password, setPassword] = useState(!isEdit && "");
    const [name, setName] = useState<string>("") 
    ;
    const [lastName, setLastName] = useState<string>("");
    const [selctedRole,setSelctedRole]= useState<number>(user && user?.roleId);

    console.log({user})
        const[selectedUserRole,setSelctedUserRole] = useState<any| undefined>(user?.role)
    // console.log(email, lastName);
  useEffect(() => {
      const setUserDetails = ()=>{
         setLastName(user.userProfile.lastName);
         setName(user.userProfile.firstName);
      }
      setUserDetails();
    }, [user?.userProfile])
    
    const handleEmailChange = (text: string) => {
      setEmail(text);
    };

    const handlePasswordChange = (text: string) => {
      setPassword(text);
    };

    const handleNameChange = (text: string) => {
      setName(text);
    };

    const handleLastNameChange = (text: string) => {
      setLastName(text);
    };
  
    const handleSubmit = () => {
      const userId = user?.id;
      console.log({ userId });
      // const password = userId ;
      onSubmit(email,user.id, name, lastName, selctedRole,);

      if (!isEdit) {
        // Reset the form
        setEmail("");
        setPassword("");
        setName("");
        setLastName("");
      }
    };

    return (
     <View style={styles.container}>
 
 {
  roles && roles.map((role) => {
    console.log('role', { role });
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }} key={role.id}>
        <RadioButton
          value="text"
          status={selctedRole === role.id ? 'checked' : 'unchecked'}
          onPress={() => setSelctedRole(role.id)}
        />
        <Text>{role.name}</Text> {/* Add Text component to display the role name */}
      </View>
    );
  })
}
       <View style={{flex:1}}>
        <Text style={mainStyle.h3}>{user?.userProfile?.firstName}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
        />
        {!isEdit && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
        )}
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={handleNameChange}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={handleLastNameChange}
        />
       
        <Button title="Submit" onPress={handleSubmit} />
      </View>
      </View>
    );
  }


export default UserDetailsComp;

const styles = StyleSheet.create({    container: {
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