import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { IconButton, MD3Colors } from 'react-native-paper'
import BulletinBoardPost from './BulletinBoardPost'

type bulletinPost =  {
 id:number , 
}
const BulletinBoardComponent = () => {

  const [posts,setPosts] = useState<bulletinPost>();
  return (
    <View>
      <Text>BulletinBoardComponent</Text>
      <View>
					<IconButton
						icon='dots-horizontal-circle-outline'
						iconColor={MD3Colors.error50}
						size={20}
						onPress={() => console.log("Pressed")}
					/>
				</View>
      <BulletinBoardPost />
    </View>
  )
}

export default BulletinBoardComponent

const styles = StyleSheet.create({})