import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { mainStyle } from "../../utils/mainStyles";
import TimePicker from "../../app/components/TimePicker";
import { TextInput, useTheme } from "react-native-paper";

const SetScedStartScreen = ({
  scheduleStartDay,
  setscheduleStartDay,
  daysPerSchedule,
  setDays,
}: any) => {
  useEffect(() => {
    console.log({ scheduleStartDay });
  }, [scheduleStartDay]);
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {/* <View style={{ flex:2, alignContent: "center" }}>
        <Text style={[mainStyle.h2,{color:theme.colors.primary}]}>
          
          Adjust each scheduale start day and duration
        </Text>
      </View> */}
      <View style={{ flex: 8, alignContent: "flex-start" }}>
        <View
          style={{
            flex:6,
            flexDirection: "row",
            marginBottom: 1,
            backgroundColor: theme.colors.tertiaryContainer,
            borderRadius: 20,
            borderWidth: 10,
            padding:10,

            borderColor: theme.colors.background,
          }}
        >
          <TimePicker
            setTime={setscheduleStartDay}
            defDayTime={scheduleStartDay}
            btnLabel={"Press to set starting Schedule"}
            btnBg={"lightblue"}
          />
        </View>
   <View style={{ flex: 1,maxHeight:75, backgroundColor: theme.colors.tertiaryContainer,borderRadius: 20,
            borderWidth: 10,justifyContent:'center', borderColor:theme.colors.background,minHeight:50,}}>
  <TextInput
    style={{
      backgroundColor: theme.colors.tertiaryContainer,
      alignSelf: 'center',
      width:'70%',
      height:45,
    }}
    label={"Number of days for schedule"}
    value={String(daysPerSchedule)}
    onChangeText={(text) => setDays(text)}
  ></TextInput>
</View>
      </View>
    </View>
  );
};

export default SetScedStartScreen;

const styles = StyleSheet.create({});
