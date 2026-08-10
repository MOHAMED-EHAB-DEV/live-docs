"use client";

import React from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { SocketProvider } from "@/components/editor/SocketProvider";

const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return (
    <SocketProvider user={user} email={user?.email || ""}>
      {children}
    </SocketProvider>
  );
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <SocketWrapper>{children}</SocketWrapper>
    </UserProvider>
  );
};

export default Provider;
