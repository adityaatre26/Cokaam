"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AppHeader() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      if (session.data?.user?.email) {
        try {
          const email = session.data.user.email;
          const response = await fetch(`/api/getUser?email=${email}`);

          if (response.ok) {
            const user = await response.json();
            if (user) {
              router.push(`/${user.UserId}`);
            } else {
              console.error("User not found");
            }
          } else {
            signIn();
          }
        } catch (error) {
          console.error("Error fetching user in client:", error);
        }
      }
    }

    redirectUser();
  }, [session, router]);

  if (session.data?.user) {
    return (
      <>
        <h1>Welcome {session.data.user.name}</h1>
        <p>Email: {session.data.user.email}</p>
        <button onClick={() => signIn()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
export default AppHeader;
