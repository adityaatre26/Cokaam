"use client";

import { UserProvider } from "@/contexts/UserContext";
import { SessionProvider } from "next-auth/react";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
export default Providers;
