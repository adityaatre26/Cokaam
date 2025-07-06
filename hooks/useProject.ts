import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ProjectInterface,
  CommitInterface,
  MembershipInterface,
  TaskInterface,
} from "@/types/projectTypes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

interface DeleteProjectParams {
  projectId: string;
  userId: string;
}

const fetchProject = async (projectId: string): Promise<ProjectData> => {
  const response = await axios.get(`/api/${projectId}/get-projects`);
  if (!response.data.data || response.data.data.length === 0) {
    throw new Error("Project not found");
  }
  return response.data.data[0];
};

const addMember = async ({ projectId, userId, email }: AddMemberParams) => {
  const response = await axios.post(`/api/projects/${projectId}/add-member`, {
    userId,
    email: email.trim(),
  });

  // Check if API returned error in response body
  if (response.data.status === "error") {
    const error = new Error(response.data.error || "Failed to add member");
    error.response = { data: response.data, status: response.status };
    throw error;
  }

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

  // Check if API returned error in response body
  if (response.data.status === "error") {
    const error = new Error(response.data.error || "Failed to remove member");
    error.response = { data: response.data, status: response.status };
    throw error;
  }

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

  // Check if API returned error in response body
  if (response.data.status === "error") {
    const error = new Error(
      response.data.error || "Failed to update repository"
    );
    error.response = { data: response.data, status: response.status };
    throw error;
  }

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

  // Check if API returned error in response body
  if (response.data.status === "error") {
    const error = new Error(response.data.error || "Failed to update project");
    error.response = { data: response.data, status: response.status };
    throw error;
  }

  return response.data;
};

const deleteProject = async ({ projectId, userId }: DeleteProjectParams) => {
  const response = await axios.delete(
    `/api/projects/${projectId}/delete-project`,
    {
      data: {
        projectId,
        UserId: userId,
      },
    }
  );

  // Check if API returned error in response body
  if (response.data.status === "error") {
    const error = new Error(response.data.error || "Failed to delete project");
    error.response = { data: response.data, status: response.status };
    throw error;
  }

  return response.data;
};

export const useProject = (projectId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (projectQuery.error) {
      // Check if it's a "Project not found" error
      const errorMessage = projectQuery.error?.message;
      if (
        errorMessage === "Project not found" ||
        (axios.isAxiosError(projectQuery.error) &&
          projectQuery.error.response?.status === 404)
      ) {
        router.push(`/projects/${projectId}/not-found`);
      }
    }
  }, [projectQuery.error, projectId, router]);

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

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: ["project", projectId] });

      // 3. Clear any related queries that might reference this project
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.some(
            (key) => typeof key === "string" && key.includes(projectId)
          );
        },
      });

      router.push("/dashboard");
    },
  });

  return {
    // Query data
    data: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,

    // Mutations - Use mutateAsync for async operations that need error handling
    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    addMemberError: addMemberMutation.error,

    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
    removeMemberError: removeMemberMutation.error,

    updateRepo: updateRepoMutation.mutateAsync,
    isUpdatingRepo: updateRepoMutation.isPending,
    updateRepoError: updateRepoMutation.error,

    updateProject: updateProjectMutation.mutateAsync,
    isProjectUpdating: updateProjectMutation.isPending,
    updateProjectError: updateProjectMutation.error,

    deleteProject: deleteProjectMutation.mutateAsync,
    deleteProjectUpdating: deleteProjectMutation.isPending,
    deleteProjectError: deleteProjectMutation.error,
  };
};
