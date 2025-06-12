"use client";

// import { ProjectProvider } from "@/contexts/ProjectContext";
import { UserProvider } from "@/contexts/UserContext";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <UserProvider>
        {/* <ProjectProvider> */}
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        {/* </ProjectProvider> */}
      </UserProvider>
    </SessionProvider>
  );
}
export default Providers;
