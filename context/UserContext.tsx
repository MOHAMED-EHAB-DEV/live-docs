"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Context,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/lib/models/user";

interface IUserContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  setReload: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserContext>({
  user: null,
  setUser: () => {},
  setReload: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [reload, setReload] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [reload]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        setReload,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
