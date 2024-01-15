import React, { createContext, useContext, useMemo } from 'react'
import { io } from 'socket.io-client';

const context = createContext(null);

export const useSocket = () => {
    const socket = useContext(context);
    return socket
}

const SocketProvider = ({ children }) => {

    const socket = useMemo(() => {
        return io('localhost:3000')
    }, [])

    return (
        <context.Provider value={socket}>
            {children}
        </context.Provider>
    )
}

export default SocketProvider