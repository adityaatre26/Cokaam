"use client";

import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

// Define the types for User and Project, this data will be sent to components consuming the context
interface User {
  id: string;
  email: string;
  username: string;
}

interface Project {
  id: string;
  name: string;
  //   description: string;
}

// All these things can be accessed by components that consume this context
interface UserContextType {
  user: User | null;
  projects: Project[];
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
  addProject: (project: Project) => void;
  deleteProjectContext: (projectId: string) => void;
  logOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchUserData = async () => {
    console.log("Fetching user data");
    if (!session) {
      console.log("No session found, please log in");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching the user data from database");

      const response = await axios.get("/api/getUser", {
        params: { email: session.user?.email },
      });
      const responseData = response.data;
      if (responseData.success) {
        console.log("User data fetched successfully");

        setUser({
          id: responseData.data.User.id,
          email: responseData.data.User.email,
          username: responseData.data.User.username,
        });

        setProjects(
          responseData.data.Projects.map((project: any) => ({
            id: project.ProjectId,
            name: project.name,
            // description: project.description,
          }))
        );

        setIsAuthenticated(true);
      } else if (
        !responseData.success &&
        responseData.message === "User not found"
      ) {
        console.log("User not in database, signing out...");
        signOut({ redirect: false });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [...prevProjects, project]);
  };

  const deleteProjectContext = (projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== projectId)
    );
  };

  const logout = () => {
    console.log("🚪 Logging out, clearing context");
    setUser(null);
    setProjects([]);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const contextValue: UserContextType = {
    user,
    projects,
    isAuthenticated,
    isLoading: status === "loading",
    fetchUserData,
    addProject,
    deleteProjectContext,
    logOut: logout,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
