import { scheduleData, shift } from "../App";



//Date utils 
export const normalizeScheduleDates = (scheduleData: scheduleData | undefined) => {
    if (scheduleData && scheduleData.data?.scedualStart !== undefined && scheduleData.data?.scedualEnd !== undefined) {
      console.log({scheduleData})
      const startDate = new Date(scheduleData.data.scedualStart);
      const endDate = new Date(scheduleData.data.scedualEnd);
      // Get the options for date formatting
      const options = {
        day: 'numeric',
        month: 'long', // 'short' for abbreviated month name, 'long' for full month name
      };
  
      // Format the date using 'toLocaleDateString'
      const formattedStartDate = startDate.toLocaleDateString(undefined, options);
      const formattedEndtDate = endDate.toLocaleDateString(undefined, options);
  
      return `${formattedStartDate} - ${formattedEndtDate}`;
    }
  
    return '';
  };
  export const getDayName = (data: Date | string | undefined) => {
    if (data) {
      const startDate = new Date(data);
  
      // Get the options for date formatting
      const options = {
        weekday: 'long', // 'short' for abbreviated day name, 'long' for full day name
      };
  
      // Format the date using 'toLocaleString'
      const formattedDay = startDate.toLocaleString(undefined, options);
  
      return formattedDay;
    }
  
    return '';
  };
  
  export const normalizeShiftTime = (data: Date | string | undefined) => {
    if (data) {
      const startDate = new Date(data);
      // console.log({data})
      startDate.setHours(startDate.getHours() + startDate.getTimezoneOffset()/60)
      // console.log({startDate});
      // Get the options for date formatting
      const options = {
        hour: 'numeric',
        minute:'numeric',
        hour12: false, // Set this to 'false' if you want 24-hour format
      };
  
      // Format the date using 'toLocaleString'
      const formattedTime = startDate.toLocaleString(undefined, options);
  
      return formattedTime;
    }
  
    return '';
  };
  
  export const normalizeShiftDate = (data: Date | string | undefined) => {
    if (data) {
      const startDate = new Date(data);
  
      // Get the options for date formatting
      const options = {
        day: 'numeric',
        month: 'numeric',
        // year: 'numeric',
      };
      // Format the date using 'toLocaleString'
      const formattedDate = startDate.toLocaleString(undefined, options);
      // console.log(formattedDate);
      console.log(formattedDate);
      return formattedDate;
    }
  
    return '';
  };

  enum shiftType {
    "morning",
    "noon",
    "night"
  }
  export const creatNewSchedule = (
    startingDate: Date,
    endDate: Date,
    shiftsADay: number,
    roles?: string[] , 
  ) => {
    const daysForSchedule: number =
      Math.abs(endDate.getTime() - startingDate.getTime()) / (24 * 60 * 60 * 1000)
    

console.log({daysForSchedule},{startingDate},{endDate})
    const shifts = [];
    const startDate = new Date(startingDate);
    // const timeZoneCorrection = startDate.getHours() + 3;
    // startDate.setHours(timeZoneCorrection);

    for (let i = 0; i < daysForSchedule; i++) {
      // startDate.setDate(startDate.getDate());
      // const shiftsADay: number = 3; // number of shifts per day, 24 must by divde by it.
      const shiftInterval: number = 24 / shiftsADay; //this will determain time of each shift
      
      // console.log({ startDate });
      for (let j = 0; j < shiftsADay; j++) {
        // console.log(shiftInterval * j, startDate.getHours());
        const h = startDate.getHours() + shiftInterval;
        // console.log({ h }, { j });
        const endDate = new Date(startDate);
        const tmpShiftType = j === 0? "Morning": j === 1? "Noon":"Night"; //the shift type
        // console.log({j}, 'j', {shiftType});
        endDate.setHours(h);
        // console.log({ j }, { startDate }, { endDate });
        // const endTime = new Date(startDate.setHours(startDate.getHours()+j));
        const dto = {
          shiftName:"",
          shiftType: tmpShiftType,
          typeOfShift:'short',
          shifttStartHour: new Date(startDate),
          shiftEndHour: new Date(endDate),
          roles:[roles],
        };
        shifts.push(dto);
        startDate.setTime(endDate.getTime());
      }
    }

    return shifts;
  }
  export const convertTimeToString= (time:{hours:number ,minutes:number})=>{
    const h:string= ""+( time.hours <10 ? "0"+time.hours : time.hours);
    const m:string = ""+(time.minutes < 10 ? "0" + time.minutes : time.minutes);

    const str: string = ""+h+":"+m;
        return  str; 
      }