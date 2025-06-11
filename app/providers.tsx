"use client";

import { ProjectProvider } from "@/contexts/ProjectContext";
import { UserProvider } from "@/contexts/UserContext";
import { SessionProvider } from "next-auth/react";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <ProjectProvider>{children}</ProjectProvider>
      </UserProvider>
    </SessionProvider>
  );
}
export default Providers;
