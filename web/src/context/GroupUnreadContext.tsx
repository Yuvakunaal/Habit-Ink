import React, { createContext, useContext, useState } from 'react';

interface GroupUnreadContextType {
  totalUnread: number;
  setTotalUnread: (n: number) => void;
}

const GroupUnreadContext = createContext<GroupUnreadContextType>({
  totalUnread: 0,
  setTotalUnread: () => {},
});

export function GroupUnreadProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  return (
    <GroupUnreadContext.Provider value={{ totalUnread, setTotalUnread }}>
      {children}
    </GroupUnreadContext.Provider>
  );
}

export function useGroupUnread() {
  return useContext(GroupUnreadContext);
}
