import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Avatar, Badge ,Text, useTheme} from 'react-native-paper'

const Userbuble = ({user,badgeContent,altText}) => {
 const theme = useTheme();
 
    return (
    <View>
      
      <View
					style={{
						flex: 1,
						borderBottomWidth:3,
						borderColor:'red',
						marginBottom:3,
						height:60,
						// width:75,
						minHeight:90,
						marginRight:5,
                        margin:2,
						// borderBottomColor:myShift?theme.colors.onBackground :theme.colors.background,
					}}
				>
					<View style={{flex:2, alignSelf: "center",justifyContent:'flex-end',alignContent:'flex-end',alignItems:'center' ,}}>
				

						<View style={{flex:1,}}>
					{badgeContent &&	<Badge style={{top:-7,right:-15,position:'absolute',zIndex:5,}}>
						{badgeContent}
					</Badge>}
						<Avatar.Icon size={45} icon='account' />
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