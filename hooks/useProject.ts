import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface AddMemberParams {
  projectId: string;
  userId: string;
  email: string;
}

interface RemoveMemberParams {
  projectId: string;
  userId: string;
  memberToRemoveId: string;
}

interface UpdateRepoParams {
  projectId: string;
  newUrl: string;
  userId: string;
}

interface UpdateProjectParams {
  projectId: string;
  newName: string | "";
  description: string | "";
  userId: string;
}

const fetchProject = async (projectId: string): Promise<ProjectData> => {
  const response = await axios.get(`/api/${projectId}/get-projects`);
  return response.data.data[0];
};

const addMember = async ({ projectId, userId, email }: AddMemberParams) => {
  const response = await axios.post(`/api/projects/${projectId}/add-member`, {
    userId,
    email: email.trim(),
  });
  return response.data;
};

const removeMember = async ({
  projectId,
  userId,
  memberToRemoveId,
}: RemoveMemberParams) => {
  const response = await axios.delete(
    `/api/projects/${projectId}/remove-member`,
    {
      data: {
        userId,
        memberToRemoveId,
      },
    }
  );
  return response.data;
};

const updateRepository = async ({
  projectId,
  newUrl,
  userId,
}: UpdateRepoParams) => {
  const response = await axios.post(`/api/projects/${projectId}/update-repo`, {
    newUrl,
    UserId: userId,
  });
  return response.data;
};

const updateProject = async ({
  projectId,
  newName,
  description,
  userId,
}: UpdateProjectParams) => {
  const response = await axios.post(
    `/api/projects/${projectId}/update-project`,
    {
      projectId,
      newName,
      description,
      userId,
    }
  );

  return response.data;
};

export const useProject = (projectId: string) => {
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  const addMemberMutation = useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      // Invalidate and refetch the project data to get updated members list
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      console.error("Error adding member:", error);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      // Invalidate and refetch the project data to get updated members list
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
    },
  });

  const updateRepoMutation = useMutation({
    mutationFn: updateRepository,
    onSuccess: () => {
      // Invalidate and refetch the project data to get updated repo info
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      console.error("Error updating repository:", error);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      // Invalidate and refetch the project data to get updated repo info
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      console.error("Error updating repository:", error);
    },
  });

  return {
    // Query data
    data: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,

    // Mutations
    addMember: addMemberMutation.mutate,
    addMemberAsync: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    addMemberError: addMemberMutation.error,

    removeMember: removeMemberMutation.mutate,
    removeMemberAsync: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
    removeMemberError: removeMemberMutation.error,

    updateRepo: updateRepoMutation.mutate,
    updateRepoAsync: updateRepoMutation.mutateAsync,
    isUpdatingRepo: updateRepoMutation.isPending,
    updateRepoError: updateRepoMutation.error,

    updateProject: updateProjectMutation.mutate,
    isProjectUpdating: updateProjectMutation.isPending,
    updateProjectError: updateProjectMutation.error,
  };
};
