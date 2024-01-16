import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { TimePickerModal } from "react-native-paper-dates";
import { Button, useTheme } from "react-native-paper";
import RoleCompenent from "../../Screens/requestTab/components/RoleCompenent";
import { shiftTemp } from "../../Screens/SettingsScreen";
import { convertTimeToString } from "../../utils/utils";
import { mainStyle } from "../../utils/mainStyles";

const SettingsShiftComp = ({ shift, updateSchedule }: any) => {
  const [startTimeVisible, setStartVisible] = useState(false);
  const [endTimeVisible, setEndVisible] = useState(false);
  const [roles, setRoles] = useState(shift.roles);
  const [updatedShift, setUpdatedShift] = useState<shiftTemp>(shift);
  const theme = useTheme();
  useEffect(() => {
    console.log({ updatedShift });
  }, [updatedShift]);

  useEffect(() => {
    console.log("Settings shift comp", { shift }, shift.roles);
    setRoles(shift.roles);
    setUpdatedShift(shift);
  }, [shift]);

  const onDismissStart = useCallback(() => {
    setStartVisible(false);
  }, [setStartVisible]);

  const onDismissEnd = useCallback(() => {
    setEndVisible(false);
  }, [setEndVisible]);

  const onConfirmStart = useCallback(
    ({ hours, minutes }: any) => {
      const tmpShift = { ...updatedShift, startHour: { hours, minutes } };
      console.log({ tmpShift });
      setUpdatedShift(tmpShift);
      updateSchedule(tmpShift);
      setStartVisible(false);
    },
    [setStartVisible, updatedShift, setUpdatedShift]
  );

  const onConfirmEndHour = useCallback(
    ({ hours, minutes }: any) => {
      const time = { hours: hours, minutes: minutes };
      const tmpShift = { ...updatedShift, endHour: { ...time } };
      console.log({ tmpShift });
      setUpdatedShift(tmpShift);
      updateSchedule(tmpShift);
      setEndVisible(false);
    },
    [setEndVisible, updatedShift, setUpdatedShift]
  );

  const updateRoles = (newRoles: string[]) => {
    console.log("shift settings comp update Roles");
    setRoles([...newRoles]);
    updateSchedule({ ...shift, roles: [...newRoles] });
  };

  return (
    <View style={{ flex: 1, borderColor: "red", borderWidth: 1, }}>
      {updatedShift.startHour && (
        <View
          style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start" }}
        >
          <Pressable onPress={() => setStartVisible(true)}>
            <Text style={mainStyle.h4}>
              Start Time: {convertTimeToString(updatedShift.startHour)}
            </Text>
          </Pressable>
          <TimePickerModal
            visible={startTimeVisible}
            onDismiss={onDismissStart}
            onConfirm={onConfirmStart}
            hours={updatedShift.startHour.hours}
            minutes={updatedShift.startHour.minutes}
          />
        </View>
      )}
      {shift.endHour && (
        <View
          style={{ flex: 1, alignItems: "flex-start" }}
        >
          <Pressable onPress={() => setEndVisible(true)}>
            <Text style={mainStyle.h4}>End time: {convertTimeToString(shift.endHour)}</Text>
          </Pressable>
          <TimePickerModal
            visible={endTimeVisible}
            onDismiss={onDismissEnd}
            onConfirm={onConfirmEndHour}
            hours={updatedShift.endHour.hours}
            minutes={updatedShift.endHour.minutes}
          />
        </View>
      )}
      <View style={{ flex:3 }}>
        <RoleCompenent
          roles={[...roles]}
          saveRoles={false}
          updateRoles={updateRoles}
        />
      </View>
    </View>
  );
};

export default SettingsShiftComp;

// ... (other styles)

const styles = StyleSheet.create({});
