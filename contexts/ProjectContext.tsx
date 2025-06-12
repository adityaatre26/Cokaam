// contexts/ProjectContext.js
import { createContext, useContext, useState } from "react";

enum Roles {
  OWNER,
  MEMBER,
}

interface Member {
  userId: string;
  username: string;
  role: Roles;
}

// interface Project {
//   ProjectId: string;
//   members: Member[]
// }

interface ProjectContextType {
  projectId: string | null;
  name: string;
  repoUrl: string;
  members: Member[];
  setProjectData: (
    id: string,
    membersList: Member[],
    name: string,
    repoUrl: string
  ) => void;
  updateMembers: (memberId: string) => void;
  clearProjectData: () => void;
  removeMember: (userId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [members, setMembers] = useState<Member[]>([]); // Array of {userId, username, role}

  const setProjectData = (
    id: string,
    membersList: Member[],
    name: string,
    repoUrl: string
  ): void => {
    setProjectId(id);
    setMembers(membersList);
    setName(name);
    setRepoUrl(repoUrl);
  };

  const updateMembers = (memberId: string): void => {
    setMembers(members.filter((member) => member.userId !== memberId));
  };

  const clearProjectData = () => {
    setProjectId(null);
    setMembers([]);
    setName("");
    setRepoUrl("");
  };

  const removeMember = (userId: string) => {
    setMembers((prev) => prev.filter((member) => member.userId !== userId));
  };

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        members,
        name,
        repoUrl,
        setProjectData,
        updateMembers,
        clearProjectData,
        removeMember,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook for easier usage
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export { Roles };
export type { Member };
