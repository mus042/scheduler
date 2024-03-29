import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScheduleCreateView from './ScheduleCreateView';
import { scheduleData, shift, user } from '../../../App';
import axios from 'axios';
import { API_URL, userAuth } from '../../../app/context/AuthContext';
import Userbuble from '../components/Userbuble';
import Example from './userReplaceMenu';
import SystemNextSchedule from '../SystemNextSchedule';
export type scheduleCreate = {
    schedule: scheduleData;
    assigend: shiftAndOptions[] ;
    unAssigend: shiftAndOptions[];
    userShiftStats: any;
};
 export type shiftAndOptions = {
    shift: shift;
    shiftOptions?: shiftOptions[];
};
export type shiftOptions = {
    userId: number;
    roleId: number;
    userPreference: string;
    userShiftId: number;
};
const CreateScheduleComp = ({allUsers}:{allUsers:any[]| undefined}) => {const [selectedUsers, setSelectedUsers] = useState<user[]>([]);
    const [submittedUsers, setSubmittedUsers] = useState<user[]>([]);
    const [scheduleShifts, setScheduleShifts] = useState();
    const [createdSched,setcreatedSched] = useState<{shifts:[],stats:[]}>();
    const me = userAuth().authState?.user;
    useEffect(() => {
        if (allUsers) {
            setSelectedUsers([...allUsers]);
        }
    }, [allUsers]);

    useEffect(() => {
        const fetchSubmittedUsers = async () => {
            try {
                const response = await axios.get(
            `${API_URL}schedule/submittedUsers/`
    );
                const data = response.data;
                // Assuming the response is an array of users
                setSubmittedUsers(data);
            } catch (error) {
                console.error("Failed to fetch submitted users:", error);
            }
        };

        fetchSubmittedUsers();
    }, []);
    const toggleUserSelection = (selectedUser: user) => {
        if (selectedUsers.some((user) => user.id === selectedUser.id)) {
            setSelectedUsers(
                selectedUsers.filter((user) => user.id !== selectedUser.id)
            );
        } else {
            setSelectedUsers([...selectedUsers, selectedUser]);
        }
    };


    const currentDate = new Date(); //current time
    const startDate = new Date(
        currentDate.getTime() + (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000
    );
    const createNewSysSchedule = async (startDate: Date,selectedUsers:user[]) => {
       
        startDate.setHours(0); // start time
        
        
		try {
			console.log({ startDate },{selectedUsers});
			const selectedUsersIds = selectedUsers.map((user)=>user.id);
			const shcedule = await axios.post(`${API_URL}schedule/createSchedule/`, {
				scedualStart: startDate,
				selctedUsers:selectedUsersIds,
			});
			return shcedule.data;
		} catch (error) {
			return { error: true, msg: (error as any).response.data.msg };
		}
	};

    const handelPress = () => {
        console.log("create new schedule ");
        const newScheudle = async () => {
            try {
                const tmpSched = await createNewSysSchedule(startDate,selectedUsers);
                console.log("tmpSched",{tmpSched});
                const sortedShifts = tmpSched.shifts.sort((a,b)=>{
                    console.log({a},{b},"a,b ")
                    return a.shift.shiftStartHour - b.shift.shiftStartHour});
                console.log("sorted shifts", {sortedShifts})
               !tmpSched.error && setcreatedSched({...tmpSched,shifts:sortedShifts});
                //  const combinedShifts = {...tmpSched.assigend , ...tmpSched.unAssigend}
                // setEmptyShifts({ ...tmpSched.emptyShifts });
                // console.log("combined assigned and un", {combinedShifts})
                return tmpSched;
            } catch (error) {
                console.log({error})
            }
          
        };
        newScheudle();
    };

    return (
        <View style={{  flexDirection: "column" ,flex:1}}>
        
            <View style={{ flexGrow: 1 }}> 
                <FlatList
                    data={allUsers}
                    keyExtractor={(user) => user.id.toString()+Math.random()}
                    horizontal={true}
                    contentContainerStyle={{
                        justifyContent:'flex-start', borderWidth:3,
                        
                        width:'100%',
                      }}
                    renderItem={({ item: user }) => (
                        <Pressable onPress={() => toggleUserSelection(user)} style={{margin:5}}>
                            <Userbuble
                                user={user}
                                badgeContent={
                                    submittedUsers.some((u) => u === user.id)
                                        ? "Sub"
                                        : undefined
                                }
                                altText={user.id === me?.id ?'Me': undefined }
                                selected={selectedUsers.some((u)=>u.id === user.id)}
                                badgeColor={undefined}
                           />
                        </Pressable>
                    )}
                />
            </View>
            <View style={{flexGrow:1}}>
                <Text>
                    Show schedule template 
                </Text>
            </View>
            <View style={{flexGrow:1}}>
            <Pressable  onPress={handelPress}>
                <Text>Create new Schedule for next week</Text>
            </Pressable>
            </View>
            <View style={{flexGrow:9}}>
              
                         {createdSched &&  allUsers &&        
                <View style={{flexGrow:1, } }>
 
          
              <ScheduleCreateView
                createdSchedule={createdSched.shifts}
                users={allUsers}
            />
         
 </View>
            }
              
{/*                
                <View style={{flex:1}}>
                <Pressable onPress={()=>console.log("approve")}>
                        <Text>Approve</Text>
                </Pressable>
                </View> */}
            </View>

        </View>
    );
};

export default CreateScheduleComp

const styles = StyleSheet.create({})