import { io, Socket } from 'socket.io-client'


const socket: Socket = io('http://localhost:3000/events');
export default socket;

export  const WebSocketComponent= ()=> {
    const socket: Socket = io('https://localhost:3000/events');
    return socket;
  };
