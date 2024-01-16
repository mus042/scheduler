import React, { useState } from 'react';
import { Appbar, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

const RequestsHeader = ({onBoxSelect,searchFunction}) => {

  //////////////////////////
  ///////////state//////////
  /////////////////////////

  const [selected, setSelected] = useState('all');
  const[showSearch,setShowSearch] = useState(false);
  const [stringToSearch,setStingToSearch] = useState<string>("");

   const showSearchModal = () => setShowSearch(true);
  const hideSearchModal = () => setShowSearch(false);
  const containerStyle = {backgroundColor: 'white', padding: 20 ,};


  const theme = useTheme(); // If you're using theming



  const onSelect = (selctedBox:'in'|'out')=>{
    //on user Select box on header 
setSelected(selctedBox);
    onBoxSelect(selctedBox);
  }


  ///STYLES///
  const styles = StyleSheet.create({
    // text: {
    //   color: 'white', // or theme.colors.onSurface if you are using theming
    // },
    touchable: {
  
      borderRadius: 4,
      minWidth:50,
      flex:2,
      
      backgroundColor:theme.colors.inverseOnSurface,
      alignItems:'center',
    },
    selectedBackground: {
      backgroundColor: theme.colors.primary,
      color:theme.colors.onBackground,
    },
    button:{
        color:theme.colors.primary,
      backgroundColor:theme.colors.inverseOnSurface,
    },
    text:{
      color:theme.colors.onBackground,
    },
    inputBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.onBackground,
      borderWidth: 2,
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      // alignSelf: "center",
      // minWidth: 300,
    },
    
  });
  

  return (
    <Appbar.Header >
    
       <View style={{ flexDirection: 'row' , flex:9 ,minHeight:40}}>
        
          <Pressable
          onPress={() => onSelect('in')}
          style={[
            styles.touchable,
            selected === 'in' ? styles.selectedBackground : styles.button,
          ]}
        >
          <Text variant='headlineMedium' style={styles.text}>In</Text>
        </Pressable>
    
        <Pressable 
          onPress={() => onSelect('out')}
          style={[
            styles.touchable,
            selected === 'out' ? styles.selectedBackground : styles.button,
          ]}
        >
          <Text variant='headlineMedium' style={styles.text}>Out</Text>
        </Pressable>
        <Pressable 
          onPress={() => onSelect('all')}
          style={[
            styles.touchable,
            selected === 'all' ? styles.selectedBackground : styles.button,
          ]}
        >
          <Text variant='headlineMedium' style={styles.text}>All</Text>
        </Pressable>
      </View>

   
        <Appbar.Action  icon="magnify" onPress={() => setShowSearch(!showSearch)} />
      
     
     
     { showSearch&& <View style={{flex:12,width:'100%'}}>
          
          <TextInput
          style={{height:30,}}
      label="search"
      mode='outlined'
      value={stringToSearch}
      onChangeText={text => setStingToSearch(text)}
      right={<TextInput.Icon icon="arrow-right-bold-box" style={{marginTop:13}} onPress={()=>{searchFunction(stringToSearch)}}/>}
    />
      </View>}
    </Appbar.Header>
  );
};

export default RequestsHeader;

