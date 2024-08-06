
import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../../app/context/AuthContext';

const ScheduleWeekPicker = ({setSelectedDate}:any) => {
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  useEffect(() => {
    const fetchAvailableWeeks = async () => {
      try {
        const response = await axios.get(`${API_URL}schedule/weeks`, {
          params: { dayOfWeek: 0 }
        });
        console.log(response.data)
        setAvailableWeeks(response.data);
      } catch (error) {
        console.error(error);
        console.log("erorrr")
      }
    };
   
    fetchAvailableWeeks();
  }, []);
 useEffect(() => {
createDate(selectedWeek)
 }, [selectedWeek])
 
//   const handleSubmit = () => {
//     axios.post('http://your-api-url/schedule', { startDate: selectedWeek, otherSettings: 'example' })
//       .then(response => alert(response.data.message))
//       .catch(error => console.error(error));
//   };
  const createDate=(dateStr:string)=>{
    console.log({dateStr});
    const newDate:Date = new Date(dateStr); 
    console.log({newDate})
    setSelectedDate(newDate)
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => {}}>
        <Text>choose week to create</Text>
      </Pressable>
      <Pressable onPress={() => {}}>
        <Text>Create new Schedule for next week</Text>
      </Pressable>
      <View style={styles.pickerContainer}>
        <Text>Select Start Date:</Text>
        <Picker
          selectedValue={selectedWeek}
          onValueChange={(itemValue) => setSelectedWeek(itemValue)}
          style={styles.picker}
        >
          {availableWeeks.map((week) => (
            <Picker.Item label={week} value={week} key={week} />
          ))}
        </Picker>
      </View>
      {/* <Button mode="contained" onPress={handleSubmit}>
        Save Schedule
      </Button> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  pickerContainer: {
    marginVertical: 16,
  },
  picker: {
    height: 50,
    width: 200,
  },
});

export default ScheduleWeekPicker;
