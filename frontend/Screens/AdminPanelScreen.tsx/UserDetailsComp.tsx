import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RadioButton, TextInput } from 'react-native-paper';
import { mainStyle } from '../../utils/mainStyles';

const UserDetailsComp=({user, onSubmit, isEdit,roles}) =>{
    const [email, setEmail] = useState(user?.email );
    const [password, setPassword] = useState(!isEdit ? "":"");
    const [name, setName] = useState<string>("") 
    ;
    const [lastName, setLastName] = useState<string>("");
    const [selctedRole,setSelctedRole]= useState<number>(user && user?.roleId);
    const [mode,setMode] = useState<"addNew"|"edit">("addNew") 
    console.log({user})
        const[selectedUserRole,setSelctedUserRole] = useState<any| undefined>(user?.role)
    // console.log(email, lastName);
  useEffect(() => {
      const setUserDetails = ()=>{
        console.log(user,"role id :",  )
         setLastName(user.userProfile.lastName);
         setName(user.userProfile.firstName);
         setSelctedRole(user.role?.id)
         setEmail(user?.email)

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
      onSubmit(email,password, name, lastName, selctedRole,);

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
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
 {

  roles && roles.map((role) => {
    console.log('role', { role });
    return (
    <View  style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }} key={role.id}>
        <RadioButton
          
          value="text"
          status={selctedRole === role.id ? 'checked' : 'unchecked'}
          onPress={() => setSelctedRole(role.id)}
        />
        <Text>{role.name}</Text>
      </View>
    );
  })
}</View>
       <View style={{flex:1}}>
        <Text style={mainStyle.h3}>{user?.userProfile?.firstName}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
        />
        {isEdit && (
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
          value={name === "new user"?"":name}
          onChangeText={handleNameChange}
        />
        <TextInput
          placeholder="Last Name"
          value={name === "new user"?"":lastName}
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