"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserPage({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Client-side session data:", session);
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to view this page</div>;
  }

  console.log(session);

  return (
    <div>
      <h1>User ID: {id}</h1>
      <p>This is the user page for user with ID: {id}</p>

      {session?.user?.accessToken && (
        <div>
          <p>GitHub Access Token: {session.user.accessToken}</p>
          <p>GitHub Username: {session.user.githubUsername}</p>
        </div>
      )}

      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
