import { scheduleData } from "../App";



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
        hour12: true, // Set this to 'false' if you want 24-hour format
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
        month: 'long',
        year: 'numeric',
      };
  
      // Format the date using 'toLocaleString'
      const formattedDate = startDate.toLocaleString(undefined, options);
  // console.log(formattedDate);
      return formattedDate;
    }
  
    return '';
  };