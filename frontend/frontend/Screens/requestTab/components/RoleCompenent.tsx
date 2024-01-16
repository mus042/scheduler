import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  MD3Colors,
  TextInput,
  useTheme,
} from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import RoleChip from "./RoleChip";

const RoleCompenent = ({updateRoles , saveRoles ,roles}) => {
  const [rolesArr, setRolesArr] = useState<{name:String,quantity:number}[]>(roles[0].roles ? roles[0].roles : [...roles]);
  const [newRoleName, setNewRoleName] = useState("");
  const [isEdit, setisEdit] = useState(-1);
  const theme = useTheme();
console.log({roles})
  useEffect(() => {
    console.log({rolesArr},typeof(roles),{roles})
    if(roles[0].id === undefined){
      console.log("roles[0].roles",roles[0].roles)
setRolesArr([...roles])
    }else{
    setRolesArr(roles[0].roles);
  }}, [roles]);

  useEffect(() => {
    console.log({rolesArr},roles)
  }, []);
  const removeItem = (itemIndex: number) => {
    try {
      const newArr = [...rolesArr];
      // newArr.splice(itemIndex, 1);
      setRolesArr(newArr);
      console.log({newArr})
    } catch (error) {
      console.log(error);
    }
  };
  const addItem = (item) => {
    //check item is not null 
    console.log({item})
    const exist = rolesArr.findIndex((arritem) => arritem === item);
    console.log({ exist },{isEdit});
    if (exist >= 0) {
      console.log("false", exist, rolesArr[exist]);
      return false;
    }
    if(item !==""){
    const tmpArr = [...rolesArr];
    tmpArr.push({name:item,quantity:1});
    setRolesArr([...tmpArr]);
    console.log("added item", { item });
    setNewRoleName("");
    if(!saveRoles){
      updateRoles(tmpArr);
    }
    return true;}
  };
  // const editItem = (item) => {
  //     console.log({ item });
  //     setNewRoleName(item);
  //     const index = rolesArr.findIndex((arritem) => arritem === item);
  //     setisEdit(index);
  //     console.log({index})
     
  // };
  const editItem = (item) => {
    console.log({ item });
    if (isEdit === -1 && rolesArr) {
      setNewRoleName(item.name);
      const index = rolesArr.findIndex((arritem) => arritem === item);
      setisEdit(index);
      console.log({ index });
    }
  };

  

  return (
    <View style={{ flex: 1, minHeight: 100, }}>
      <View style={{flex:5,maxHeight:53, flexDirection: "row", margin: 5, marginBottom: 10 }}>
        <IconButton
          icon="plus"
          iconColor={MD3Colors.error50}
          size={20}
          onPress={() => addItem(newRoleName)}
        />
        <TextInput
          label="Role Name"
          dense
          style={{ paddingVertical: 1, fontSize: 14  }}
          value={newRoleName}
          onChangeText={(text) => setNewRoleName(text)}
        />
      </View>
      {/* <Chip icon="information" closeIcon="close" onClose={(()=>console.log("close"))} onPress={() => console.log('Pressed')}>Example Chip</Chip> */}
      <View style={{ flex: 4 }}>
        {/* <FlatList style={{flex:1,margin:1}} horizontal={true} data={rolesArr} 
    renderItem={(item)=><RoleChip role={item} 
    
    />
   }
    />  */}
    
        <View style={{flex:1, flexDirection: "row", flexWrap: "wrap" }}>
          {rolesArr && rolesArr.map((item, index) => (
            <View key={index} style={{ minWidth: 20 }}>
              <RoleChip role={item.name} edit={editItem} />
            </View>
          ))}
        </View>
      </View>
      <View
        style={{
          flex: 1,
        
          marginBottom:10,
          margin:5, 
          borderColor:'yellow',
          borderWidth:2,
        }}
      >
     { saveRoles !==false &&  <Button
          style={{ backgroundColor:theme.colors.primary }}
          textColor={theme.colors.onPrimary}
          icon="transfer-right"
          
          
          onPress={() => saveRoles(rolesArr)}
        >
          Save
        </Button>}
      </View>
    </View>
  );
};

export default RoleCompenent;

const styles = StyleSheet.create({});
