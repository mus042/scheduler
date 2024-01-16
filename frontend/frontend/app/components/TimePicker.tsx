import { StyleSheet, Text, View,Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, ThemeProvider, useTheme } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import CustomDayTimePicker from "./CustomDayTimePicker";
import { normalizeShiftDate } from "../../utils/utils";
import { mainStyle } from "../../utils/mainStyles";

const TimePicker = ({ setTime, defDayTime ,btnLabel,btnBg}:any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState();

  const [dayTime, setDayTime] = useState<{
    day: { value: string; label: string };
    hours: number;
    minutes: number;
  }>(defDayTime);
const theme = useTheme();
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);
  const onConfirm = React.useCallback(
    ({ day, hours, minutes }) => {
      setVisible(false);
      console.log("onconfim:",{ day },{hours},minutes);
      setDayTime({ day:{...day}, hours, minutes });
      setTime({ day, hours, minutes });
      console.log({ day, hours, minutes });
    },
    [setVisible]
  );
  useEffect(() => {
    console.log({ dayTime }, dayTime.day.label);
  }, [dayTime]);

  return (
    <View style={{ flex: 1 }}>
      
        <Pressable
          onPress={() => setVisible(true)}
          style={{flex:1}}
          >
          <View style={{flex:1,}}>
          <Text >{btnLabel}</Text>
         <View style={{flex:1}}>
           <Text > 
            day:<Text style={{color:theme.colors.primary}}> {dayTime.day.label}day</Text>
            </Text>
            </View>
            <View style={{flex:1}}>
            <Text >
              On:<Text style={{color:theme.colors.primary}}> 0{dayTime.hours}:0{dayTime.minutes}</Text>
            </Text>
            </View>
          </View>
        </Pressable>

        {/* <TimePickerModal
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onConfirm}
            hours={18}
            minutes={0}
            use24HourClock={true}
          /> */}
          <View style={{flex:1}}>
        <CustomDayTimePicker
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          hours={dayTime.hours}
          minutes={dayTime.minutes}
          use24HourClock={true}
          day={dayTime.day}
        />
      </View>
    </View>
  );
};

export default TimePicker;

const styles = StyleSheet.create({});
