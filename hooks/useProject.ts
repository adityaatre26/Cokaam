import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ProjectInterface,
  CommitInterface,
  MembershipInterface,
  TaskInterface,
} from "@/types/projectTypes";

interface ProjectData {
  projectInfo: ProjectInterface;
  members: MembershipInterface[];
  activeTasks: TaskInterface[];
  recentCommits: CommitInterface[];
}

const fetchProject = async (projectId: string): Promise<ProjectData> => {
  const response = await axios.get(`/api/${projectId}/get-projects`);
  return response.data.data[0];
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId, // Only run if projectId exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
