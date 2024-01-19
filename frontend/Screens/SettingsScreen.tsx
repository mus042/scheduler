import { StyleSheet, View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Divider,
  IconButton,
  MD3Colors,
  Menu,
  SegmentedButtons,
  Surface,
  Switch,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { TimePickerModal } from "react-native-paper-dates";
import TimePicker from "../app/components/TimePicker";
import DayPicker from "../app/components/DayPicker";
import CustomTimePicker, {
  CustomDayTimePicker,
} from "../app/components/CustomDayTimePicker";
import { mainStyle } from "../utils/mainStyles";
import RoleCompenent from "./requestTab/components/RoleCompenent";
import ShiftRoleSettingsComp from "./requestTab/components/ShiftRoleSettingsComp";
import { creatNewSchedule } from "../utils/utils";
import EditShiftNames from "./Components/EditShiftNames";
import { ScrollView } from "react-native-gesture-handler";
import SetScedStartScreen from "./Settings/SetScedStartScreen";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import { API_URL, userAuth } from "../app/context/AuthContext";

type scedualeDate = {
  day: { value: string; label: string } | undefined;
  hours: number;
  minutes: number;
};
export type shiftTemp = {
  id: number | undefined;
  startHour: { hours: number; minutes: number } | Date;
  endHour: { hours: number; minutes: number } | Date;
  day?: { value: number; label: string } | undefined;
  name: string;
  scheduleId?: number;
  roles: {name: string, quantity: number}[] | undefined;
};
type schedualSettings = {
  id?: number;
  organizationId: number | undefined;
  name?: string | undefined;
  description?: string | undefined;
  start: scedualeDate;
  end: scedualeDate;
  shiftsTemplate: shiftTemp[];
  restDay: { start: scedualeDate; end: scedualeDate };
};
type scheduleMold = {
  id: number;

  name: String;
  description?: String;
  start: Date;
  end: Date;
  shiftsADay: number;

  selected: boolean;

  organizationId: number;
  shifts: shiftTemp;
};
type scheduleTemplate = {
  shifts: shiftTemp[];
  scedualeSettings: schedualSettings;
};

const SettingsScreen = ({ setSettingsShow }) => {
  //context
  const organizationId = userAuth().authState?.user?.orgId;

  //State
  const [value, setValue] = React.useState([""]);
  const [shiftsRolesArr, setShiftsRolesArr] = useState<any>([
    {
      endHour: { hours: 14, minutes: 0 },
      id: 0,
      name: "morning",
      roles: [{name:"shift Manger",quantity:1}],
      startHour: { hours: 6, minutes: 0 },
      day:undefined,
    },
  ]);
  const [dayShiftTemplate, setDayShiftTemplate] = useState<any>([
    {
      endHour: { hours: 0, minutes: 0 },
      id: -1,
      name: "",
      roles: ["shift Manger"],
      startHour: { hours: 0, minutes: 0 },
      day:undefined,
    },
  ]);
  const [name, setname] = useState<string>();
  const [scheduleStartDay, setscheduleStartDay] = useState<scedualeDate>({
    day: { value: "0", label: "Sun" },
    hours: 6,
    minutes: 0,
  });
  const [scheduleEndDay, setscheduleEndDay] = useState<scedualeDate>({
    day: { value: "6", label: "Sat" },
    hours: 6,
    minutes: 0,
  });
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [shiftsADay, setshiftsADay] = useState(3);
  const [daysPerSchedule, setdaysPerSchedule] = useState(7);
  const [restDayHoursS, setRestDayHoursS] = useState<{
    start: scedualeDate;
    end: scedualeDate;
  }>({
    start: { day: { value: "0", label: "Sunday" }, hours: 6, minutes: 0 },
    end: { day: { value: "6", label: "sunday" }, hours: 6, minutes: 0 },
  });
  const defScedSettings: schedualSettings = {
    organizationId: organizationId,
    start: { day: { value: "0", label: "Sunday" }, hours: 6, minutes: 0 },
    end: { day: { value: "6", label: "SaturDay" }, hours: 6, minutes: 0 },
    shiftsTemplate: [
      {
        id: 0,
        name: "morning",
        startHour: { hours: 6, minutes: 0 },
        endHour: { hours: 14, minutes: 0 },
        roles: undefined,
        day:undefined,
      },
      {
        id: 1,
        name: "Noon",
        startHour: { hours: 14, minutes: 0 },
        endHour: { hours: 22, minutes: 0 },
        roles: undefined,
        day:undefined,
      },
      {
        id: 2,
        name: "Night",
        startHour: { hours: 22, minutes: 0 },
        endHour: { hours: 6, minutes: 0 },
        roles: undefined,
        day:undefined,
      },
    ],
    restDay: {
      start: { day: { value: "6", label: "Friday" }, hours: 6, minutes: 0 },
      end: { day: { value: "0", label: "Saterday" }, hours: 6, minutes: 0 },
    },
  };
  const [schedualSettings, setscedualSettings] =
    useState<schedualSettings>(defScedSettings);
  const [scheduleTemplate, setscheduleTemplate] = useState<scheduleTemplate>();
  const [tempScheduleShifts, setTempScheduleShifts] = useState<shiftTemp[]>([]);
  // const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

  //
  ///
  ////Context / Theme
  ///
  //
  const theme = useTheme();

  ///
  ////
  ///// UTILS ////
  ////
  ///
  //
  const getDayObject = (value) => {
    console.log({ value });

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    console.log(daysOfWeek[Number(value)]);
    if (value >= 0 && value <= 6) {
      return {
        value: value,
        label: daysOfWeek[Number(value) - 1],
      };
    }
    return {
      value: -1,
      label: "",
    };
  };
  /////
  ////
  ////
  const createScedhualeTemplat = (newShiftTemp: shiftTemp[] | undefined) => {
    console.log(
      { schedualSettings },
      { scheduleStartDay },
      schedualSettings.shiftsTemplate,
      { shiftsRolesArr }
    );
    console.log({ newShiftTemp });
    //update shift template to new start and end
    const newShiftTemplate = !newShiftTemp
      ? schedualSettings.shiftsTemplate.map((shift, index) => ({
          ...shift,
          startHour: {
            hours:
              index === 0
                ? scheduleStartDay.hours
                : scheduleStartDay.hours + 8 * index,
            minutes: scheduleStartDay.minutes,
          },
          endHour: {
            hours:
              index === 0
                ? scheduleStartDay.hours + 8
                : scheduleStartDay.hours + 8 + 8 * index,
            minutes: scheduleStartDay.minutes,
          },
        }))
      : [...newShiftTemp];

    console.log({ newShiftTemplate });
    const settings: schedualSettings = {
      organizationId:organizationId,
      name:'deafult-settings',
      description:'',
      start: scheduleStartDay,
      end: scheduleEndDay,
      restDay: restDayHoursS,
      shiftsTemplate: [...newShiftTemplate],
    };
    console.log("settings", { settings });
    const tmpSceduleSTemplate: scheduleTemplate = {
      shifts: [],
      scedualeSettings: settings ? { ...settings } : schedualSettings,
    };
    console.log({ tmpSceduleSTemplate }, tmpSceduleSTemplate.shifts);

    //set shifts arr for the tamplate  for shifts template for each day.
    //Normalize Start and end into Date objects
    let day = Number(settings.start.day.value) - 1;
    const startDate = new Date(day);
    // Calculate the difference between the desired day (0 for Sunday) and the current day.
    let currentDayOfWeek = startDate.getDay(); // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)
    let dayDifference = day - currentDayOfWeek;
    // console.log({ settings },settings.start.day,day,{dayDifference});
    startDate.setDate(startDate.getDate() + dayDifference);

    const endDate = new Date(startDate); // Create a new Date object to avoid mutating the original date.
    endDate.setTime(endDate.getTime() + daysPerSchedule);

    startDate.setHours(settings.start.hours);
    startDate.setMinutes(settings.start.minutes);
    endDate.setHours(settings.start.hours);
    endDate.setMinutes(settings.start.minutes);
    //Creat new days templat for schedule
    dayDifference =
      Number(settings.start.day.value) - Number(settings.end.day.value);
    const dayTamplate: shiftTemp[] = [];
    console.log({ dayDifference });

    let index: number = 0;
    for (let i = Number(settings.start.day?.value); i < daysPerSchedule; i++) {
      console.log({ i }, { dayDifference }, { settings }, { shiftsRolesArr });
      settings.shiftsTemplate.forEach((shift) => {
        console.log("for each", { shift }, shiftsRolesArr);
        const tmpShift: shiftTemp = {
          startHour: shift.startHour,
          endHour: shift.endHour,
          roles: settings.shiftsTemplate[0].roles ? [...settings.shiftsTemplate[0].roles] : [],
          id: index,
          name: shift.name,
          day: getDayObject(i),
        };
        index++;
        dayTamplate.push(tmpShift);
        console.log({ dayTamplate });
      });
    }
    console.log({ dayTamplate });
    tmpSceduleSTemplate.shifts = [...dayTamplate];
    console.log({ tmpSceduleSTemplate });
    setscheduleTemplate(tmpSceduleSTemplate);
    setscedualSettings(settings);
    setTempScheduleShifts(dayTamplate);
  };

  //useEffect
  useEffect(() => {
    console.log("UseEffect Schedule Settings ", { schedualSettings });

    createScedhualeTemplat(undefined);
  }, [daysPerSchedule, scheduleStartDay]);
  useEffect(() => {
    console.log("tmp sched has changed", { tempScheduleShifts });
  }, [tempScheduleShifts]);

  const onDismiss = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = useCallback(
    ({ hours, minutes }) => {
      setVisible(false);
      setRestDayHoursS({ startHour: hours, startMinutes: minutes });

      console.log({ hours, minutes });
    },
    [setVisible]
  );
  const createScheduleTemplate = (start, end, shiftsAday, roles) => {
    //Normalize Start and end into Date objects
    let day = Number(start.day.value) - 1;
    const startDate = new Date(day);
    // Calculate the difference between the desired day (0 for Sunday) and the current day.
    let currentDayOfWeek = startDate.getDay(); // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)
    let dayDifference = day - currentDayOfWeek;
    startDate.setDate(startDate.getDate() + dayDifference);
    day = Number(end.day.value) - 1;
    console.log({ day }, day);
    const endDate = new Date(day); // Create a new Date object to avoid mutating the original date.
    dayDifference = day - currentDayOfWeek;
    // console.log({startDate},{endDate} , day,start.day.value)
    dayDifference =
      Number(start.day.value) - 1 !== day ? dayDifference : dayDifference + 7;
    // console.log({dayDifference},day)
    // Add the day difference in milliseconds to the date to set it to the desired day (Sunday).
    endDate.setDate(endDate.getDate() + dayDifference);
    // console.log({endDate})
    startDate.setHours(start.hours);
    startDate.setMinutes(start.minutes);
    endDate.setHours(end.hours);
    endDate.setMinutes(end.minutes);
    //Creat new days templat for schedule
    const dayTamplate = [];

    //
  };
  const createDayTamplate = {
    numberOfShifts: 3,
    startHoure: 0,
    endHoure: 0,
    roles: [],
  };
  const updateNames = (newArr) => {
    console.log({ newArr }, { schedualSettings });
    const scedSettings: schedualSettings = {
      ...schedualSettings,
      shiftsTemplate: [...newArr],
    };
    createScedhualeTemplat(newArr);
    console.log({ scedSettings });
    setscedualSettings(scedSettings);
  };

  const setDays = (str: string) => {
    //cast input into number . check for invalid input
    console.log(Number(str), { str });
    if (Number(str) !== undefined) {
      if (Number(str) === 0) {
        setdaysPerSchedule(0);
      }
      if (Number(str) > 2 && Number(str) <= 60) {
        setdaysPerSchedule(Number(str));
        if (scheduleStartDay.day) {
          const end = getDayObject(scheduleStartDay.day.value + Number(str));
          console.log({ end });
          setscheduleEndDay({
            day: { ...end },
            hours: 6,
            minutes: 0,
          });
        }
      }
    }
  };
  const updateShiftTemlate = (shifts) => {
    console.log("update settings screen");
    setTempScheduleShifts([...shifts]);
    console.log({ shifts });
  };

  const saveSettings = () => {
    console.log("save settings");
    // Add api call to save on server , load save icon until recived respons
    const saveSettings = async () => {
      const result = await axios.post(`${API_URL}schedule/setScheduleMold`, {
        ...schedualSettings,
        name: schedualSettings.name || "deafult name",
        organizationId: organizationId,
        description: "",
        shiftsTemplate: tempScheduleShifts,
      });
    };
    saveSettings();
    setSettingsShow(true);
  };
  // return (
  //   <ScrollView>
  //     <View style={{ flex: 1 }}>
  //       <View>
  //         <Text style={mainStyle.h1}>Settings Screen</Text>
  //       </View>

  //       <SetScedStartScreen  scheduleStartDay={scheduleStartDay} setscheduleStartDay={setscheduleStartDay} daysPerSchedule={daysPerSchedule} setDays={setDays}/>
  //       {/* Configer shifts */}
  //       <View style={{ flex: 1 }}>
  //         <View>
  //           <Text style={mainStyle.h2}>Shifts configration</Text>
  //           {/* number of shifts a day , shifts start and end times */}
  //         </View>
  //         {/* if 8 shifts allow for 12 shifts a day  */}
  //         {/* Add or remove different roles  */}
  //         <View style={{ flex: 4 }}>
  //           <EditShiftNames
  //             setShiftNames={updateNames}
  //             defShifts={schedualSettings.shiftsTemplate}
  //           />
  //         </View>
  //         <View style={{ flex: 3, marginTop: 10 }}>
  //           <View style={{ flex: 1 }}>
  //             <Text>roles:</Text>
  //           </View>
  //           <View style={{ flex: 3 }}>
  //             <RoleCompenent
  //               updateRoles={setRolesArr}
  //               saveRoles={saveRoles}
  //               roles={["Shift Maneger"]}
  //             />
  //           </View>
  //         </View>
  //         <View style={{ flex: 1 }}>
  //           {/* <View style={{ flex: 1, margin:5 }}>
  //           <Text>
  //             Configure spesific day :
  //             {/* consider creating schedule mold at this point , user will change sttings ? */}
  //           {/* </Text> */}
  //           {/* </View>  */}
  //           {/* pick day of week , pick number of shifts , pick shift start - end  */}
  //           <View>
  //             <Text> day: , number of shifts </Text>
  //           </View>
  //         </View>
  //         <View style={{ flex: 2 }}>
  //           <ShiftRoleSettingsComp
  //             schedule={[...tempScheduleShifts]}
  //             range={{
  //               start: scheduleStartDay.day.value,
  //               end: scheduleEndDay.day.value,
  //             }}
  //             updatedSchedule={updateShiftTemlate}
  //           />
  //         </View>
  //       </View>
  //     </View>
  //   </ScrollView>
  // );
  const Stack = createStackNavigator();
  const Screen1 = ({ navigation }) => {
    //Set the Scedule start and for how many days
    const saveScheduleStart = () => {
      createScedhualeTemplat(undefined);
      console.log({ schedualSettings });
      navigation.navigate("Shift Names Screen");
    };

    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 3 }}>
          <SetScedStartScreen
            scheduleStartDay={scheduleStartDay}
            setscheduleStartDay={setscheduleStartDay}
            daysPerSchedule={daysPerSchedule}
            setDays={setDays}
          />
        </View>
        <View
          style={{
            flex: 2,
            marginBottom: 20,
            backgroundColor: theme.colors.background,
            margin: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[mainStyle.h4, { color: theme.colors.secondary }]}>
              Schedule will start on{" "}
              <Text style={[mainStyle.h3, { color: theme.colors.tertiary }]}>
                {schedualSettings.start.day?.label}
              </Text>
              ,
            </Text>
            <Text style={[mainStyle.h4, { color: theme.colors.secondary }]}>
              At{" "}
              <Text style={[mainStyle.h3, { color: theme.colors.tertiary }]}>
                {schedualSettings.start.hours < 10
                  ? "0" + schedualSettings.start.hours
                  : schedualSettings.start.hours}
                :
                {schedualSettings.start?.minutes < 10
                  ? "0" + schedualSettings.start.minutes
                  : schedualSettings.start.minutes}{" "}
              </Text>
              And will end on
              <Text style={[mainStyle.h3, { color: theme.colors.tertiary }]}>
                {" "}
                {schedualSettings.end.day?.label},
              </Text>
            </Text>
            <Text style={[mainStyle.h4, { color: theme.colors.secondary }]}>
              At{" "}
              <Text style={[mainStyle.h3, { color: theme.colors.tertiary }]}>
                {schedualSettings.end.hours < 10
                  ? "0" + schedualSettings.end.hours
                  : schedualSettings.end.hours}
                :
                {schedualSettings.end?.minutes < 10
                  ? "0" + schedualSettings.end?.minutes
                  : schedualSettings.end?.minutes}
              </Text>
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View>
            <Text
              style={[
                mainStyle.h5,
                { flex: 1, color: theme.colors.outline, alignSelf: "center" },
              ]}
            >
              press next to set the shifts in genral
            </Text>
          </View>

          <View style={{ flex: 1, marginTop: 10, margin: 10 }}>
            <Button
              icon="arrow-right-thin"
              style={{ backgroundColor: theme.colors.primary }}
              textColor={theme.colors.onPrimary}
              mode="outlined"
              compact={true}
              onPress={() => saveScheduleStart()}
              contentStyle={{ flexDirection: "row-reverse" }}
            >
              next
            </Button>
          </View>
        </View>
      </View>
    );
  };
  const Screen2 = ({ navigation }) => {
    const saveRoles = (newRoles) => {
      // const scedSettings:schedualSettings = {...schedualSettings,};
      const newShiftsTemp: shiftTemp[] = schedualSettings.shiftsTemplate.map(
        (shift) => ({
          ...shift,
          roles: [...newRoles],
        })
      );
      setShiftsRolesArr(newShiftsTemp);
      const newSetting: schedualSettings = {
        ...schedualSettings,
        shiftsTemplate: [...newShiftsTemp],
      };
      console.log({ newSetting }, { newShiftsTemp });
      createScedhualeTemplat(newShiftsTemp);
      navigation.navigate("Edit Days Screen");
    };

    console.log(schedualSettings.shiftsTemplate);
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 5, margin: 4 }}>
          <EditShiftNames
            setShiftNames={updateNames}
            defShifts={schedualSettings.shiftsTemplate}
          />
        </View>
        <View style={{ flex: 2, marginBottom: 5, margin: 4, maxHeight: 220 }}>
          <ScrollView>
            <RoleCompenent
              updateRoles={setShiftsRolesArr}
              saveRoles={saveRoles}
              roles={shiftsRolesArr}
            />
          </ScrollView>
        </View>
      </View>
    );
  };
  const EditDaysScreen = ({ navigation }) => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 6 }}>
          <ShiftRoleSettingsComp
            schedule={[...tempScheduleShifts]}
            range={{
              start: scheduleStartDay.day.value,
              end: scheduleEndDay.day.value,
            }}
            updatedSchedule={updateShiftTemlate}
          />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            marginBottom: 10,
            margin: 5,
          }}
        >
          <Button
            icon="arrow-right-thin"
            style={{ backgroundColor: theme.colors.primary }}
            textColor={theme.colors.onPrimary}
            mode="outlined"
            compact={true}
            onPress={() => saveSettings()}
            contentStyle={{ flexDirection: "row-reverse" }}
          >
            Save
          </Button>
        </View>
      </View>
    );
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Edit Scheduale Start and end"
        component={Screen1}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: 0,
            borderBottomColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.colors.onBackground,
          },
        }}
      />
      <Stack.Screen
        name="Shift Names Screen"
        component={Screen2}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: 0,
            borderBottomColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.colors.onBackground,
          },
        }}
      />

      <Stack.Screen
        name="Edit Days Screen"
        component={EditDaysScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: 0,
            borderBottomColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.colors.onBackground,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  surface: {
    padding: 4,
    // height: 40,
    minHeight: 20,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
