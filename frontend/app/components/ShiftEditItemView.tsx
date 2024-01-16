
import React from 'react';
import { View, Text, TouchableOpacity ,StyleSheet} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, interpolate, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const ShiftEditItemView = ({ item, onDelete, onEdit }) => {
    const translationX = useSharedValue(0);
    const swipeableItemWidth = 100; // Adjust this to your desired swipeable width
  
    const onSwipeableOpen = (toValue) => {
      translationX.value = withTiming(toValue, { duration: 250, easing: Easing.inOut(Easing.ease) });
    };
  
    const onSwipeableClose = () => {
      translationX.value = withSpring(0);
    };
  
    const deleteItem = () => {
      onSwipeableClose();
      onDelete(item);
    };
  
    const editItem = () => {
      onSwipeableClose();
      onEdit(item);
    };
  
    return (
      <PanGestureHandler
        onGestureEvent={(e) => {
          translationX.value = e.nativeEvent.translationX;
        }}
        onHandlerStateChange={(e) => {
          if (e.nativeEvent.state === 4) {
            if (translationX.value > swipeableItemWidth / 2) {
              onSwipeableOpen(swipeableItemWidth);
            } else if (translationX.value < -swipeableItemWidth / 2) {
              onSwipeableOpen(-swipeableItemWidth);
            } else {
              onSwipeableClose();
            }
          }
        }}
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 50, // Adjust this to your desired item height
            backgroundColor: 'white',
            transform: [{ translateX: translationX }],
          }}
        >
          <TouchableOpacity onPress={editItem} style={{ backgroundColor: 'blue', padding: 16 }}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteItem} style={{ backgroundColor: 'red', padding: 16 }}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  }
export default ShiftEditItemView

const styles = StyleSheet.create({})