import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Avatar, Badge ,Text, useTheme} from 'react-native-paper'

const Userbuble = ({user,badgeContent,altText,selected, badgeColor}) => {
 const theme = useTheme();
 console.log({user});

 const bColor = badgeColor? badgeColor : theme.colors.error;
 const selctedStyle = selected && {borderWidth:4,borderColor:theme.colors.onPrimaryContainer, padding:3} ;
    return (
    <View style={{flex:1}}>
      
     <View
					style={{
						// borderBottomWidth:3,
						// borderColor:'red',
						marginBottom:3,
						height:55,
						// width:75,
						minHeight:50,
						marginRight:5,
                        margin:2,
						// borderBottomColor:myShift?theme.colors.onBackground :theme.colors.background,
					}}
				>
					<View style={{flex:1, alignSelf: "center",justifyContent:'flex-end',alignContent:'flex-end',alignItems:'center' ,}}>
				

						<View style={{flex:4,}}>
					{badgeContent &&	<Badge style={[{top:-7,right:-15,position:'absolute',zIndex:5,backgroundColor:bColor}]}>
						{badgeContent}
					</Badge>}
						<Avatar.Icon size={45} icon='account' style={selctedStyle}/>
						</View>
					<View style={{flex:1}}>
					<Text variant='bodySmall' style={{ color: theme.colors.primary,alignSelf:'center' }}>
							{!altText ? user.userProfile.firstName : altText}{" "}
						</Text>
					</View>
						
					</View>
    </View>
    </View>
  )
}

export default Userbuble

const styles = StyleSheet.create({})