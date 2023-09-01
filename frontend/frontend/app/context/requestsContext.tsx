// RequestsContext.tsx
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL, userAuth } from "./AuthContext";
import { userRequest } from "../../App";

interface RequestsProps {
  requests: requests | null;
  setSeen:(requestDto:userRequest)=>void;
}

type requests = {
  recived: userRequest[] | null;
  sent: userRequest[] | null;
}

const RequestsContext = createContext<RequestsProps>({ requests: null });

export const useRequests = () => useContext(RequestsContext);

export const RequestsProvider = ({ children }: any) => {
  const [recivedRequests, setRecivedRequests] = useState<userRequest[] | null>(null);
  const [sentRequests, setSentRequests] = useState<userRequest[] | null>(null);
  const { authState } = userAuth();

  useEffect(() => {
    if(!authState?.authenticated){
      console.log("no auth");
      return; 
    }
    const getRequests = async () => {
      if (authState?.authenticated) {
        const sentrequests = await axios.get(`${API_URL}user-request/getallUserSentrequest`);
        setSentRequests(sentrequests.data);

        const incomingReq = await axios.get(`${API_URL}user-request/getallUserRecivedrequest`);
        setRecivedRequests(incomingReq.data);

        console.log("Requests received:", incomingReq?.data);
        console.log("Requests sent:", sentrequests?.data);
      }
    };

    getRequests();
  }, [authState?.authenticated]);

  // Update the requests object whenever the incoming or sent requests change
  useEffect(() => {
    const updatedRequests: requests = {
      recived: recivedRequests,
      sent: sentRequests,
    };
    console.log("Updated requests:", updatedRequests);

  }, [recivedRequests, sentRequests]);


  const setSeen = (requestDto:userRequest) =>{
    console.log({requestDto});
    if(requestDto){
    //api_call change status 
      const res = axios.post(`${API_URL}user-request/setStatus`,requestDto);
      console.log({res});
    }
  }

  return (
    <RequestsContext.Provider value={{ requests: { recived: recivedRequests, sent: sentRequests } , setSeen}}>
      {children}
    </RequestsContext.Provider>
  );
};
