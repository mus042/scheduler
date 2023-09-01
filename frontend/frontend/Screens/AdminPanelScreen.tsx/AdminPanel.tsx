import {
  Button,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { API_URL } from "../../app/context/AuthContext";
import { user } from "../../App";
import UserNextScheduleComp from "../DashBoardScreen/components/UserNextScheduleComp";
import UserCurrentSchedule from "../DashBoardScreen/components/UserCurrentSchedule";
import { shift, scheduleData } from "../../App";
import SystemNextSchedule from "./SystemNextSchedule";
import { mainStyle } from "../../utils/mainStyles";

const AdminPanel = () => {
  // TODO
  //Add user - implment errors handel
  //edit user -  implement  constrains and error handeling
  //edit self -  To Be added to user DashBoard
  //useres Schedules
  //generate new schedule -V - includ users for schedule
  //edit shift -  as admin
  //edit schedule -

  const [allUsers, setAllUsers] = useState();
  const [currentSchedule, setCurrentSchedule] = useState<scheduleData>();
  const [nextSystemSchedule, setNextSystemSchedul] = useState<scheduleData>();
  const [emptyShifts , setEmptyShifts] = useState<shift[]>();
  const [createdSched, setcreatedSched] = useState();
 
  useEffect(() => {
    const allUsers = async () => await getAllUsers();
    const getCurrentSched = async () => {
      const sched = await axios.get(`${API_URL}schedule/getCurrentSchedule `);
      const scheduleData: scheduleData = { ...sched.data };
      console.log({ scheduleData });
      setCurrentSchedule(scheduleData);
      // console.log({currentSchedule});
    };
    getCurrentSched();
  }, []);

  useEffect(() => {
    const getNextSystemSched = async () => {
      const sched = await axios.get(
        `${API_URL}schedule/getNextSystemSchedule/`
      );
      const scheduleData: scheduleData = { ...sched.data };
      console.log({ scheduleData });

      setNextSystemSchedul(scheduleData);
    };
    getNextSystemSched();
  }, [createdSched]);
  useEffect(() => {
    console.log("Updated currentSchedule:", currentSchedule ,emptyShifts);
  }, [currentSchedule]); // Log the updated currentSchedule value

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: () => false,
  });

  const CreateNewScheduleComp = () => {
    

    const currentDate = new Date(); //current time
    const startDate = new Date(
      currentDate.getTime() + (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000
    );
    startDate.setHours(9, 0, 0, 0); // start time

    const handelPress = () => {
      console.log("create new schedule ");
      const newScheudle = async () => {
        const tmpSched = await createNewSysSchedule(startDate);
console.log(tmpSched);
        setcreatedSched({...tmpSched.fiild2sched});
        setEmptyShifts({...tmpSched.emptyShifts});
        return tmpSched;
      };
      newScheudle();
    };

    return (
      <>
        <Pressable style={styles.button} onPress={handelPress}>
          <Text>Create new Schedule for next week</Text>
        </Pressable>
        <View>
          {createdSched && (
            <FlatList
              data={createdSched}
              renderItem={(item) => <Text>{item.id}</Text>}
            />
          )}
        </View>
      </>
    );
  };
  const createNewSysSchedule = async (startDate: Date) => {
    try {
      console.log({ startDate });
      const shcedule = await axios.post(`${API_URL}schedule/createSchedule/`, {
        scedualStart: startDate,
      });
      return shcedule.data;
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const addUser = async (email, password, firstName, lastName) => {
    console.log({ email, password, firstName, lastName });
    try {
      return await axios.post(`${API_URL}auth/addUserAsAdmin`, {
        email,
        password,
        firstName,
        lastName,
      });
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const editUser = async (
    email: string,
    userId: number,
    firstName: string,
    lastName: string
  ) => {
    //To change backend object dto
    try {
      console.log({ userId }, email, firstName);
      const dto = {
        email: email,
        firstName: firstName,
        lastName: lastName,
      };

      console.log({ dto });
      return await axios.post(`${API_URL}users/editUserAsAdmin/`, {
        userId: userId,
        dto: dto,
      });
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const getAllUsers = async () => {
    try {
      const result = await axios.get(`${API_URL}users/allUsers`);
      if (result) {
        setAllUsers(result.data);
        return result.data;
      }
    } catch (error) {
      return { error: true, msg: (error as any).response.data.msg };
    }
  };

  const editUserComponent = (userToEdit: user) => {
    //get user to edit ,

    return <>userDetailsComp(userToEdit,editUser,true);</>;
  };
  function newScheduleComp() {
    const [nextSchedule, setNextSchedule] = useState();

    return (
      <View>
        <Text>next weeks Schedule :</Text>
      </View>
    );
  }
  const getUsersShiftsForNextSched = async (users) => {
    //get all users
    const usersShifts: Record<number, { user: user; shifts: any }> = {};
    // const users = await getAllUsers();
    for (const user of users) {
      const shifts = await axios.get(`${API_URL}schedule/getNextSchedule`, {
        params: { userId: user.id },
      });
      if (shifts) {
        console.log(shifts.data);
        usersShifts[user.id] = {
          user: { ...user },
          shifts: { ...shifts.data },
        };
      }
    }
    if (usersShifts) {
      console.log({ usersShifts });
      return usersShifts;
    } else {
      console.log("cant find next schedulas or shifts ");
    }
  };

  function usersSchedulesComp() {}

  function userDetailsComp(user, onSubmit, isEdit) {
    const [email, setEmail] = useState(user?.email ? user.email : "");
    const [password, setPassword] = useState(!isEdit && "");
    const [name, setName] = useState(
      user ? (user.firstName !== null ? user.firstName : "") : ""
    );
    const [lastName, setLastName] = useState(
      user ? (user.lastName !== null ? user.lastName : "") : ""
    );

    // console.log(email, lastName);

    const handleEmailChange = (text: string) => {
      setEmail(text);
    };

    const handlePasswordChange = (text: string) => {
      setPassword(text);
    };

    const handleNameChange = (text: string) => {
      setName(text);
    };

    const handleLastNameChange = (text: string) => {
      setLastName(text);
    };

    const handleSubmit = () => {
      const userId = user?.id;
      console.log({ userId });
      // const password = userId ;
      onSubmit(email, userId ? userId : password, name, lastName);

      if (!isEdit) {
        // Reset the form
        setEmail("");
        setPassword("");
        setName("");
        setLastName("");
      }
    };

    return (
      <View style={styles.container}>
        <Text style={mainStyle.h3}>Add user</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
        />
        {!isEdit && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={handleNameChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={handleLastNameChange}
        />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    );
  }

  function UserItem({ item, setEditUser }) {
    return (
      <>
        <Pressable onPress={() => setEditUser(!editUser)}>
          <Text>item.email</Text>
          {editUser && userDetailsComp(item.item, editUser, true)}
          {/* Component to show user next scheudle  */}
        </Pressable>
      </>
    );
  }
  function allUsersComp() {
    const [editUser, setEditUser] = useState(false);

    return (
      <>
        <Pressable onPress={() => getAllUsers()}>
          <Text>get all users</Text>
        </Pressable>
        {allUsers?.length > 0 && <Text>{allUsers[0].email}</Text>}
        {allUsers?.length > 0 && (
          <FlatList
            data={allUsers}
            renderItem={(item) => (
              <UserItem item={item} setEditUser={setEditUser} />
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </>
    );
  }

  return (

    <ScrollView style={styles.mainContainer}>
      <Text style={mainStyle.h3}>AdminPanel</Text>
      <View {...panResponder.panHandlers}>
        <UserCurrentSchedule scheudle={currentSchedule} />
      </View> 
      <SystemNextSchedule nextSchedule={nextSystemSchedule} />
      <CreateNewScheduleComp />
      {/* <View>{userDetailsComp(null, addUser, false)}</View> */}
      <View>{allUsersComp()}</View>
    </ScrollView>
   
  );
};

export default AdminPanel;

const styles = StyleSheet.create({
  mainContainer: {
    maxWidth: "98%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#F194FF",
    width: "30%",
    maxWidth: 350,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderColor: "black",
    borderWidth: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
