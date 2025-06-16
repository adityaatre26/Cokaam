"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Custom Hooks & Context
import { useProject } from "@/hooks/useProject";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import {
  Settings,
  ArrowLeft,
  Trash2,
  UserMinus,
  GitBranch,
  AlertTriangle,
  ExternalLink,
  Plus,
  Mail,
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ProjectSettings() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, deleteProjectContext } = useUser();

  // Use the enhanced hook with mutations
  const {
    data,
    isLoading,
    error,
    addMember,
    isAddingMember,
    addMemberError,
    removeMember,
    isRemovingMember,
    removeMemberError,
    updateRepo,
    isUpdatingRepo,
    updateRepoError,
    updateProject,
    isProjectUpdating,
    updateProjectError,
    deleteProject,
    deleteProjectError,
    deleteProjectUpdating,
  } = useProject(projectId);

  const [projectName, setProjectName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Sync fetched data with local state
  useEffect(() => {
    if (data?.projectInfo) {
      setProjectName(data.projectInfo.name || "");
      setRepositoryUrl(data.projectInfo.repoUrl || "");
    }
  }, [data]);

  const handleRepoChange = async (newRepoUrl: string) => {
    if (!user?.id) {
      console.log("User not authenticated");
      return;
    }

    updateRepo({
      projectId,
      newUrl: newRepoUrl,
      userId: user.id,
    });
  };

  const handleAddMember = async () => {
    if (!user?.id) {
      console.log("User not authenticated");
      return;
    }

    if (!memberEmail.trim()) {
      console.log("Email is required");
      return;
    }

    try {
      await addMember({
        projectId,
        userId: user.id,
        email: memberEmail.trim(),
      });

      // Reset form and close dialog on success
      setMemberEmail("");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (userTBD: string) => {
    if (!user?.id) {
      console.log("User not authenticated");
      return;
    }

    removeMember({
      projectId,
      userId: user.id,
      memberToRemoveId: userTBD,
    });
  };

  const handleProjectChange = async (
    newName: string | "",
    description: string | ""
  ) => {
    updateProject({
      projectId,
      userId: user!.id,
      newName,
      description,
    });
  };

  const handleDeleteProject = async () => {
    if (!user?.id) {
      console.log("User not authenticated");
      return;
    }

    await deleteProject({
      projectId,
      userId: user.id,
    });

    deleteProjectContext(projectId);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading project settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Error loading project. Please try again.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Project not found.
      </div>
    );
  }

  const members = data.members || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-[#780000] rounded-md"></div>
                <span className="text-lg font-extralight tracking-wider">
                  flow
                </span>
              </Link>
              <span className="text-gray-600">/</span>
              <Link
                href={`/projects/${projectId}`}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="font-normal text-sm capitalize">
                  {projectName}
                </span>
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-300 font-normal text-sm">
                settings
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Link
              href={`/projects/${projectId}`}
              className="text-gray-300 hover:text-white transition-colors mr-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              back to project
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-4 flex items-center">
            <Settings className="h-8 w-8 mr-4" />
            Project Settings
          </h1>
          <p className="text-gray-300 font-normal">
            manage project configuration and team access
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Error Messages */}
          {(addMemberError ||
            removeMemberError ||
            updateRepoError ||
            updateProjectError ||
            deleteProjectError) && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-400 text-sm">
                  {addMemberError && "Failed to add member. "}
                  {removeMemberError && "Failed to remove member. "}
                  {updateRepoError && "Failed to update repository. "}
                  Please try again.
                </span>
              </div>
            </div>
          )}

          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gray-950/50 border border-gray-800/30 rounded-lg p-6">
              <h2 className="text-xl font-extralight mb-6">General</h2>
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="project-name"
                    className="text-sm text-gray-300 font-normal mb-2 block"
                  >
                    Project Name
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-gray-900/50 border-gray-800/30 text-gray-200 font-normal focus:border-gray-700"
                    />
                    <Button
                      variant="outline"
                      style={{
                        visibility:
                          projectName !== data.projectInfo.name
                            ? "visible"
                            : "hidden",
                      }}
                      onClick={() => handleProjectChange(projectName, "")}
                      className="border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                      disabled={isProjectUpdating}
                    >
                      {isUpdatingRepo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="repository-url"
                    className="text-sm text-gray-300 font-normal mb-2 block"
                  >
                    Repository URL
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="repository-url"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      className="bg-gray-900/50 border-gray-800/30 text-gray-200 font-normal focus:border-gray-700"
                      disabled={isUpdatingRepo}
                    />
                    <Button
                      variant="outline"
                      style={{
                        visibility:
                          repositoryUrl !== data.projectInfo.repoUrl
                            ? "visible"
                            : "hidden",
                      }}
                      onClick={() => handleRepoChange(repositoryUrl)}
                      disabled={isUpdatingRepo}
                      className="border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                    >
                      {isUpdatingRepo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    changing the repository will update all connected
                    integrations
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Management */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gray-950/50 border border-gray-800/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extralight flex items-center">
                  <GitBranch className="h-5 w-5 mr-2" />
                  Team Members
                </h2>
                <Dialog
                  open={isInviteDialogOpen}
                  onOpenChange={setIsInviteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-[#00607a] hover:bg-[#007a9a] text-white font-normal transition-all duration-300 hover:px-6"
                      disabled={isAddingMember}
                    >
                      {isAddingMember ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      add member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-950 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-extralight flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Add Team Member
                      </DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Enter the email address of the person you`d like to
                        invite to this project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="member-email"
                          className="text-sm text-gray-300 font-normal mb-2 block"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="member-email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          className="bg-gray-900/50 border-gray-800/30 text-gray-200 font-normal focus:border-gray-700"
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !isAddingMember &&
                            handleAddMember()
                          }
                          disabled={isAddingMember}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                        className="border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                        disabled={isAddingMember}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMember}
                        className="bg-[#00607a] hover:bg-[#007a9a] text-white font-normal transition-all duration-300 hover:px-6"
                        disabled={isAddingMember || !memberEmail.trim()}
                      >
                        {isAddingMember ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Invitation"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {members.filter(Boolean).map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-900/50 rounded-full flex items-center justify-center relative">
                        <span className="text-sm font-normal text-gray-200">
                          {member.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-normal text-gray-200 capitalize flex items-center space-x-2">
                          <span>{member.username}</span>
                          {member.role === "OWNER" && (
                            <Badge className="bg-[#00607a]/20 text-[#00607a] text-xs">
                              owner
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    {member.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={isRemovingMember}
                      >
                        {isRemovingMember ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                removed members will lose access to this project immediately
              </p>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-950/50 border border-red-900/30 rounded-lg p-6">
              <h2 className="text-xl font-extralight mb-6 flex items-center text-red-400">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Danger Zone
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                  <div>
                    <h3 className="text-sm font-normal text-gray-200 mb-1">
                      Delete Project
                    </h3>
                    <p className="text-xs text-gray-400">
                      permanently delete this project and all associated data.
                      this action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={deleteProjectUpdating}
                        className="border-red-800 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-700 transition-colors"
                      >
                        {deleteProjectUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        delete project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-950 border-red-900/30 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-extralight flex items-center text-red-400">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Delete Project
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Are you absolutely sure you want to delete the{" "}
                          <strong className="text-red-300">
                            {projectName}
                          </strong>{" "}
                          project?
                          <br />
                          <br />
                          This will permanently delete all associated data.
                          <br />
                          <strong className="text-red-400">
                            This action cannot be undone.
                          </strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          className="bg-red-600 hover:bg-red-700 text-white font-normal transition-all duration-300"
                        >
                          Yes, Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
