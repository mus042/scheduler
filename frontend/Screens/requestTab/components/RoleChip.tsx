import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Chip } from 'react-native-paper'

const RoleChip = ({role , edit}) => {
    const [visible,setVisible] = useState(true);
    console.log({role})
  const onClose=()=>{
    console.log("press")
    setVisible(false);
  }

    return (
    <View style={{flex:1 , margin:1}}>
      {visible && <Chip icon="application-edit-outline" 
    closeIcon="close" onClose={onClose} 
    onPress={() => edit(role)}>{role}</Chip>}
    </View>
  )
}

export default RoleChip

const styles = StyleSheet.create({})