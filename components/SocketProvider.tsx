"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket/types";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents> | null;

const SocketContext = createContext<{ socket: SocketType; isConnected: boolean }>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<SocketType>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize the socket connection
        const socketInitializer = async () => {
            // No need to fetch /api/socket/io anymore with custom server

            const socketInstance: SocketType = ClientIO(undefined, {
                path: "/api/socket/io",
                addTrailingSlash: false,
            });

            socketInstance.on("connect", () => {
                console.log("Connected to Socket.io Server");
                setIsConnected(true);
            });

            socketInstance.on("disconnect", () => {
                console.log("Disconnected from Socket.io Server");
                setIsConnected(false);
            });

            setSocket(socketInstance);
        };

        socketInitializer();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
