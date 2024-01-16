import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { dueDateSchedule, scheduleData, scheduleInfo, shift } from "../../App";
import WeeklyView from "../DashBoardScreen/components/WeeklyView";
import { Button } from "react-native-paper";
import axios from "axios";

const SystemNextSchedule = ({
  nextSchedule,
  onDeleteSched,
}: {
  nextSchedule: scheduleData | undefined;
  onDeleteSched:any,
}) => {
  const [localNextSched, setLocalNextSched] = useState<
    scheduleInfo | undefined
  >();

  const [scheduleShifts, setScheduleShifts] = useState<shift[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [daysToSubmit, setDaysToSubmit] = useState<number>();
  useEffect(() => {
    console.log({ nextSchedule });
    if (nextSchedule && nextSchedule.data !== undefined) {
      console.log("useEffect 16 ", { nextSchedule });
      const days = dueDateSchedule();
      setDaysToSubmit(days);
      setLocalNextSched(nextSchedule.data);
      if (typeof nextSchedule.shifts === "object") {
        const shiftsArr = Object.values(nextSchedule.shifts);
        setScheduleShifts(shiftsArr);
      } else {
        setScheduleShifts(nextSchedule.shifts);
      }

      setLoading(false); // Set loading to false when data is fetched
    }
  }, [nextSchedule]);

  useEffect(() => {
    console.log("system localNextSched:", localNextSched, scheduleShifts);
  }, [localNextSched]);



  if (loading) {
    console.log("loading");
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    ); // Render a loading state while data is being fetched
  }

  return (
    <View style={styles.container}>
      <Text>Sytem NextScheduleComp</Text>
      {localNextSched && (
        <View style={styles.scheduleContainer}>
          {nextSchedule !== null && (
            <View>
            <WeeklyView
              scheduleInfo={nextSchedule?.data}
              shifts={scheduleShifts}
              update={null}
            />
              <Button compact onPress={() => onDeleteSched()}  >
          Delete This Schedule
        </Button>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SystemNextSchedule;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "red",
    maxWidth: "100%",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 2,
    marginVertical: 1,
    marginHorizontal: 1,
  },
  title: {
    fontSize: 12,
  },
  scheduleContainer: {
    flex:1
  },
});
