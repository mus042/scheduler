// RequestsContext.tsx
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL, userAuth } from "./AuthContext";
import { userRequest } from "../../App";
import { useSnackbarContext } from "../../Screens/SnackbarProvider";

interface RequestsProps {
  requests: requests | null;
  updateStatus: undefined | any;
  sendReq: undefined | any;
  replayToReq: undefined | any;
  updateInRequests: undefined | any;
}

type requests = {
  recived: userRequest[] | null;
  sent: userRequest[] | null;
  unseen: { in: number; out: number } | null;
};

const RequestsContext = createContext<RequestsProps>({
  requests: null,
  updateStatus: undefined,
  sendReq: undefined,
  replayToReq: undefined,
  updateInRequests: undefined,
});

export const useRequests = () => useContext(RequestsContext);

export const RequestsProvider = ({ children }: any) => {
  const [recivedRequests, setRecivedRequests] = useState<userRequest[] | null>(
    null
  );
  const [sentRequests, setSentRequests] = useState<userRequest[] | null>(null);
  const [newRequestes, setNewRequests] = useState<{ in: number; out: number }>({
    in: 0,
    out: 0,
  });
  const [changedReq, setChangedReq] = useState(false);
  const { authState } = userAuth();
  const { addSnackBarToQueue } = useSnackbarContext();

  const countNewInReq = ()=>{
    let newInCount = 0;
    if(recivedRequests){
    for (const req of recivedRequests) {
      if (req.status !== "seen") {
        console.log(req.status);
        console.log("unseen");
        newInCount++;
      }
    }
    }
    // Update the state for new requests
    setNewRequests((prevState) => ({ in: newInCount, out: prevState.out }));

  }
  useEffect(() => {
    if (!authState?.authenticated) {
      console.log("no auth");
      return;
    }
    const getRequests = async () => {
      if (authState?.authenticated) {
        // Fetch sent requests
        const sentrequests = await axios.get(
          `${API_URL}user-request/getallUserSentrequest`
        );
        setSentRequests(sentrequests.data);
        console.log("Requests sent:", sentrequests?.data);

        // Fetch received requests
        const receivedReq = await axios.get(
          `${API_URL}user-request/getallUserRecivedrequest`
        );
        setRecivedRequests(receivedReq.data);
        console.log("Requests received:", receivedReq?.data);
        countNewInReq();
        // Calculate new (unseen) requests
       
      }
    };

    getRequests();
    //set changed back to false
    setChangedReq(false);
  }, [authState?.authenticated, changedReq]);

  useEffect(() => {
    console.log({ authState }, authState?.socket);
    authState?.socket !== null  &&
      authState?.socket.on("newRequest", (request) => {
        console.log("new Message 75 ", { request });
        //Call action to reload requests or update list.
        addSnackBarToQueue({snackbarMessage:"new replay: " + request.requestAnswerMsg})
        setChangedReq(true);
      });
  }, []);

  // Update the requests object whenever the incoming or sent requests change
  useEffect(() => {
    const updatedRequests: requests = {
      recived: recivedRequests,
      sent: sentRequests,
      unseen: newRequestes,
    };

    console.log("Updated requests:", updatedRequests);
  }, [recivedRequests, sentRequests]);

  const updateInRequests = (req: userRequest | userRequest[]) => {
    //for each req-> check if not in list of incoming, add it if not.
    const checkIfInList = (tmpReq) =>
      !recivedRequests
        ? -1
        : recivedRequests.findIndex((item) => item.id === tmpReq.id);
    console.log({ req }, checkIfInList(req));
    if (Array.isArray(req)) {
      for (const reqToCheck of req) {
        if (checkIfInList(reqToCheck) > -1) {
          //Req allready in list
        } else {
          const tmpList = recivedRequests;
          tmpList?.push(reqToCheck);
          setRecivedRequests(tmpList);
          //animation and other options for reciving new req
        }
      }
    } else if (checkIfInList(req) === -1) {
      //req not arr  and not in list
      const tmpList = recivedRequests || [];
      console.log("not in list ");
      tmpList.push(req);
      setRecivedRequests(tmpList);
    }
  };

  const setSeen = (requestDto: userRequest) => {
    console.log({ requestDto });
    if (requestDto) {
      //api_call change status
      const res = axios.post(`${API_URL}user-request/setStatus`, requestDto);
      setChangedReq(true);
      console.log({ res });
    }
  };
  const sendReq = async (requestDto) => {
    console.log("set new Req");

    const respone = await axios.post(
      `${API_URL}user-request/setRequest`,
      requestDto
    );
    console.log({ respone });
    setChangedReq(true);
    return respone;
  };
  const replayToReq = async () => {
    //To Replay to a req
  };
  return (
    <RequestsContext.Provider
      value={{
        requests: {
          recived: recivedRequests,
          sent: sentRequests,
          unseen: newRequestes,
        },
        updateStatus: setSeen,
        sendReq,
        replayToReq,
        updateInRequests,
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
};
