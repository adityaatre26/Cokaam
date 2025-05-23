"use client";

// Random testing push delivery comment nothing has changed
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function AppHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function redirectUser() {
      if (status === "authenticated" && session?.user?.email) {
        console.log("Header session data:", session);
        try {
          const email = session.user.email;
          const response = await fetch(`/api/getUser?email=${email}`);

          if (response.ok) {
            const user = await response.json();
            if (user) {
              router.push(`/${user.UserId}`);
            } else {
              console.error("User not found");
            }
          } else {
            console.error("Error fetching user");
          }
        } catch (error) {
          console.error("Error fetching user in client:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      }
    }

    redirectUser();
  }, [session, status, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (status === "authenticated" && session?.user) {
    return (
      <>
        <h1>Welcome {session.user.name}</h1>
        <p>Email: {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn("github")}>Sign in with GitHub</button>
    </>
  );
}

export default AppHeader;
