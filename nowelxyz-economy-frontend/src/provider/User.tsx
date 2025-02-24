import IUser from '@/utils/types/IUser';
import { BACKEND_API } from '@/utils/urls';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserContextType {
  user: IUser | null;
  userloading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);


export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [userloading, setUserloading] = useState(true);

  useEffect(() => {

    async function fetchUser() {
        const response = await fetch(`${BACKEND_API}/users/@me`, {
            credentials: 'include'
        });

        const ResUser = await response.json();
        setUser(ResUser.data);
        setUserloading(false);
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, userloading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}