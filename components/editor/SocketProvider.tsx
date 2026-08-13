"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

export interface ActiveUser {
  email: string;
  name?: string;
  avatar?: string;
  image?: string;
  color?: string;
  socketId?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: ActiveUser[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: [],
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
  email?: string;
  user?: {
    email: string;
    name?: string;
    image?: string;
    color?: string;
  } | null;
  documentId?: string;
}

export const SocketProvider = ({
  children,
  email,
  user,
  documentId,
}: SocketProviderProps) => {
  const parentContext = useContext(SocketContext);
  const [localSocket, setLocalSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  // Prefer parent socket if available
  const socket = parentContext?.socket || localSocket;

  const userEmail = user?.email || email || "";
  const userName = user?.name || (userEmail ? userEmail.split("@")[0] : "User");
  const userAvatar = user?.image || "";

  // 1. Manage Socket creation if root / standalone
  useEffect(() => {
    if (parentContext?.socket) {
      setIsConnected(parentContext.isConnected);
      return;
    }

    const socketInstance = io(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/live-docs` || "http://localhost:7860/live-docs",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      if (userEmail) {
        socketInstance.emit("register_user", userEmail);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setLocalSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [parentContext?.socket, userEmail]);

  // 2. Manage register_user when userEmail changes on existing socket
  useEffect(() => {
    if (!socket || !userEmail) return;
    if (socket.connected) {
      socket.emit("register_user", userEmail);
    }
  }, [socket, userEmail]);

  // 3. Manage document join/leave and activeUsers
  useEffect(() => {
    if (!socket || !documentId) {
      if (!documentId) setActiveUsers([]);
      return;
    }

    const handleActiveUsers = (users: ActiveUser[]) => {
      setActiveUsers(users || []);
    };

    socket.on("active_users", handleActiveUsers);

    if (userEmail && socket.connected) {
      socket.emit("join_document", {
        documentId,
        user: {
          email: userEmail,
          name: userName,
          avatar: userAvatar,
        },
      });
    }

    return () => {
      socket.off("active_users", handleActiveUsers);
      if (userEmail && socket.connected) {
        socket.emit("leave_document", {
          documentId,
          email: userEmail,
        });
      }
    };
  }, [socket, documentId, userEmail, userName, userAvatar]);

  const effectiveConnected = parentContext?.socket
    ? parentContext.isConnected
    : isConnected;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: effectiveConnected,
        activeUsers: documentId ? activeUsers : (parentContext?.activeUsers || []),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};


