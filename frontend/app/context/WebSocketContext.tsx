// // WebSocketContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { Socket, io } from "socket.io-client";
// import { API_URL, userAuth } from "./AuthContext";

// interface SocketProps {
//   socket: Socket | null;
// }

// const WebSocketContext = createContext<SocketProps>({socket:null});

// export const useWebSocket = ()=>{return useContext(WebSocketContext)};

// export const SocketProvider = ({ children }: any) => {
//   const [socket, setSocket] = useState<SocketProps>({ socket: null });
//   const { authState } = userAuth();

//   useEffect(() => {
//     // Connect to the WebSocket server when the component mounts
//     console.log({ authState });
//     if (!authState?.authenticated) {
//       console.log("no auth");
//       return;
//     }

//     if (!socket?.socket?.connected) {
//       const tmpsocket = io(`${API_URL}events`, {
//         auth: (cb: any) => {
//           // Use the updated token from the userAuth context
//           cb({ token: authState.token });
//         },
//       });

//       // Listen for events or perform any other setup for the socket instance
//       setSocket({ socket: tmpsocket });
//       console.log({ tmpsocket });
//     }
//     // Clean up the socket connection when the component unmounts
//     return () => {
//       socket.socket && socket.socket.disconnect();
//     };
//   }, [authState]);

//   useEffect(() => {
//     console.log({ socket });
//   }, [socket]);

//   return (
//     <WebSocketContext.Provider value={socket}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // DashboardScreen.tsx
// // ... (unchanged)
