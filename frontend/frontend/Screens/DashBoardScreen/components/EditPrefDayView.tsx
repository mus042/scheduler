import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Icon,
  IconButton,
  MD3Colors,
  Text,
} from "react-native-paper";
import { normalizeShiftTime } from "../../../utils/utils";

const EditPrefDayView = ({ dayName, date, dayShifts, updateShifts }) => {
  console.log({dayShifts});
  const [localPref, setLocalPref] = useState<{
    morning: string;
    noon: string;
    night: string;
  }>({
    morning: dayShifts[0].userPreference,
    noon: dayShifts[1].userPreference,
    night: dayShifts[2].userPreference,
  });

  useEffect(() => {
    setLocalPref({
      morning: dayShifts[0].userPreference,
      noon: dayShifts[1].userPreference,
      night: dayShifts[2].userPreference,
    });
  }, [dayShifts]);

  const LeftContent = (props) => {
    const day: string = dayName.slice(0, 1).toLocaleLowerCase();

    return (
      <Avatar.Icon
        {...props}
        icon={`alpha-${day}-box`}
        style={{ marginRight: 5 }}
      />
    );
  };

  const onCancel = () => {
    setLocalPref({
      morning: dayShifts[0].userPreference,
      noon: dayShifts[1].userPreference,
      night: dayShifts[2].userPreference,
    });
  };
  const onSaveDay = () => {
    const updatedShifts = [...dayShifts];
    dayShifts[0].userPreference = localPref.morning;
    dayShifts[1].userPreference = localPref.noon;
    dayShifts[2].userPreference = localPref.night;
    console.log({ updatedShifts });
    updateShifts(updatedShifts);
  };

  return (
    <Card mode="elevated" style={{ width: 240, margin: 5 }}>
      <Card.Title
        title={dayName}
        subtitle={date}
        titleVariant="titleSmall"
        subtitleVariant="labelLarge"
        right={LeftContent}
      />
      <Card.Content>
        <View>
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1 }}>
            <Text variant="labelLarge" style={{ textAlign: "center" }}>
              {" "}
              MORNING
            </Text>
          </View>
          <View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                width: 200,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                icon="checkbox-marked-circle-plus-outline"
                size={18}
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, morning: "1" })}
                selected={localPref.morning === "1"}
              />

              <IconButton
                icon="alert-circle-check-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, morning: "2" })}
                size={18}
                selected={localPref.morning === "2"}
              />

              <IconButton
                icon="close-circle-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, morning: "3" })}
                size={18}
                selected={localPref.morning === "3"}
              />
            </View>
          </View>
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1 }}>
            <Text variant="labelLarge" style={{ textAlign: "center" }}>
              {" "}
              NOON
            </Text>
          </View>
          <View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                width: 200,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                icon="checkbox-marked-circle-plus-outline"
                size={18}
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, noon: "1" })}
                selected={localPref.noon === "1"}
              />

              <IconButton
                icon="alert-circle-check-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, noon: "2" })}
                size={18}
                selected={localPref.noon === "2"}
              />

              <IconButton
                icon="close-circle-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, noon: "3" })}
                size={18}
                selected={localPref.noon === "3"}
              />
            </View>
          </View>
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1 }}>
            <Text variant="labelLarge" style={{ textAlign: "center" }}>
              {" "}
              NIGHT
            </Text>
          </View>
          <View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                width: 200,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                icon="checkbox-marked-circle-plus-outline"
                size={18}
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, night: "1" })}
                selected={localPref.night === "1"}
              />

              <IconButton
                icon="alert-circle-check-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, night: "2" })}
                size={18}
                selected={localPref.night === "2"}
              />

              <IconButton
                icon="close-circle-outline"
                mode="contained"
                onPress={() => setLocalPref({ ...localPref, night: "3" })}
                size={18}
                selected={localPref.night === "3"}
              />
            </View>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button compact onPress={() => onCancel()}>
          Cancel
        </Button>
        <Button onPress={() => onSaveDay()}>Update</Button>
      </Card.Actions>
    </Card>
  );
};

export default EditPrefDayView;

const styles = StyleSheet.create({});
