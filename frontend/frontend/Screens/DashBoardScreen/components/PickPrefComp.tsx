import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PickPrefComp = ({  }) => {
    return (
      <FlatList
        style={[styles.flatListStyle]}
        horizontal={true}
        data={[1,2,3]}
        keyExtractor={(item, index) => `child-item-${index}`}
        renderItem={({ item }) => (
          <Text style={styles.itemStyle}>{item}</Text>
        )}
      />
    )
  }
  
  const styles = StyleSheet.create({
    flatListStyle: {
      flex: 1,
      // Add other styles that should always apply to your FlatList
    },
    itemStyle: {
      color: 'red',
      // Add other styles for your items
    },
    // Add other styles as needed
  })
  
  export default PickPrefComp;
  