"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Custom Hooks & Context
import { useProject } from "@/hooks/useProject";
import { useErrorHandler } from "@/hooks/useErrorHandler";

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
import ErrorToast from "@/components/ErrorToast";

// Icons
import {
  ArrowLeft,
  Trash2,
  UserMinus,
  AlertTriangle,
  ExternalLink,
  Plus,
  Mail,
  Loader2,
  SettingsIcon,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Validation utilities
import {
  sanitizeInput,
  validateGithubUrl,
  validateLength,
  validateRequired,
  validateEmail,
} from "@/utils/validation";
import LoadingScreen from "@/components/LoadingPage";

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

    removeMember,
    isRemovingMember,

    updateRepo,
    isUpdatingRepo,

    updateProject,
    isProjectUpdating,

    deleteProject,

    deleteProjectUpdating,
  } = useProject(projectId);

  // Error handler hook
  const {
    error: validationError,
    handleApiError,
    hideError,
    showError,
  } = useErrorHandler();

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

  // Validation functions
  const validateProjectName = (name: string) => {
    const requiredError = validateRequired(name, "Project name");
    if (requiredError) {
      showError(requiredError, "validation");
      return false;
    }

    const lengthError = validateLength(name, 3, 50, "Project name");
    if (lengthError) {
      showError(lengthError, "validation");
      return false;
    }

    return true;
  };

  const validateRepositoryUrl = (url: string) => {
    const repoError = validateGithubUrl(url);
    if (repoError) {
      showError(repoError, "validation");
      return false;
    }

    // Additional GitHub URL validation
    const githubUrlPattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
    if (!githubUrlPattern.test(url)) {
      showError(
        "GitHub URL must be in format: https://github.com/username/reponame",
        "validation"
      );
      return false;
    }

    return true;
  };

  const validateMemberEmail = (email: string) => {
    const requiredError = validateRequired(email, "Email");
    if (requiredError) {
      showError(requiredError, "validation");
      return false;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      showError(emailError, "validation");
      return false;
    }

    return true;
  };

  const handleRepoChange = async (newRepoUrl: string) => {
    if (!user?.id) {
      showError("User not authenticated", "validation");
      return;
    }

    if (!validateRepositoryUrl(newRepoUrl)) {
      return;
    }

    try {
      await updateRepo({
        projectId,
        newUrl: sanitizeInput(newRepoUrl),
        userId: user.id,
      });
    } catch (error) {
      console.error("Failed to update repository:", error);
      handleApiError(error);
      // showError("Repo updation error", "server");
    }
  };

  const handleAddMember = async () => {
    if (!user?.id) {
      showError("User not authenticated", "validation");
      return;
    }

    if (!validateMemberEmail(memberEmail)) {
      return;
    }

    try {
      await addMember({
        projectId,
        userId: user.id,
        email: sanitizeInput(memberEmail.trim()),
      });

      // Reset form and close dialog on success
      setMemberEmail("");
      setIsInviteDialogOpen(false);
      hideError();
    } catch (error) {
      console.error("Failed to add member:", error);
      handleApiError(error);
    }
  };

  const handleRemoveMember = async (userTBD: string) => {
    if (!user?.id) {
      showError("User not authenticated", "validation");
      return;
    }

    try {
      await removeMember({
        projectId,
        userId: user.id,
        memberToRemoveId: userTBD,
      });

      hideError();
    } catch (error) {
      console.error("Failed to remove member:", error);
      handleApiError(error);
    }
  };

  const handleProjectChange = async (
    newName: string | "",
    description: string | ""
  ) => {
    if (!user?.id) {
      showError("User not authenticated", "validation");
      return;
    }

    if (!validateProjectName(newName)) {
      return;
    }

    try {
      await updateProject({
        projectId,
        userId: user.id,
        newName: sanitizeInput(newName),
        description: sanitizeInput(description),
      });

      hideError();
    } catch (error) {
      console.error("Failed to update project:", error);
      handleApiError(error);
    }
  };

  const handleDeleteProject = async () => {
    if (!user?.id) {
      showError("User not authenticated", "validation");
      return;
    }

    try {
      await deleteProject({
        projectId,
        userId: user.id,
      });

      await deleteProjectContext(projectId);
      hideError();
    } catch (error) {
      console.error("Failed to delete project:", error);
      handleApiError(error);
    }
  };

  // Reset validation errors when dialog closes
  const handleInviteDialogClose = (open: boolean) => {
    setIsInviteDialogOpen(open);
    if (!open) {
      setMemberEmail("");
      hideError();
    }
  };

  // Loading and error states
  if (isLoading) {
    return <LoadingScreen />;
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
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="border-b border-b-gray-500 border-dashed backdrop-blur-md sticky top-0 z-50 rounded-b-3xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-1 flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-7 h-7 bg-[#780000] rounded-md" />
              <Link href="/dashboard" className="flex items-center space-x-3">
                <span className="text-lg font-extralight tracking-wider font-darker text-gray-200">
                  Cokaam
                </span>
              </Link>
              <span className="text-gray-600">/</span>
              <Link
                href={`/projects/${projectId}`}
                className="text-gray-300 hover:text-white transition-colors mt-0.5"
              >
                <span className="text-gray-300 font-primary text-sm capitalize">
                  {projectName}
                </span>
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-300 font-primary text-sm mt-1">
                settings
              </span>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <motion.div
              whileHover={{ x: -4, scale: 1.04, color: "#fff" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors mr-4 flex items-center font-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                back to dashboard
              </Link>
            </motion.div>
          </div>
          <SettingsIcon className="transition-all duration-150 ease-out hover:rotate-90" />
          <h1 className="text-4xl md:text-7xl font-darker font-medium tracking-tight mb-0.5 capitalize">
            Project Settings
          </h1>
          <p className="text-gray-300 font-primary mb-6 ml-2">
            Manage project configuration and team access
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-[#0c0c0c] border border-gray-600 border-dashed rounded-lg p-6">
              <h2 className="text-4xl font-darker font-semibold mb-5">
                General
              </h2>
              <div className="mb-5 mt-2">
                <Label
                  htmlFor="project-name"
                  className="text-md text-gray-300 font-primary mb-2 block"
                >
                  Project Name
                </Label>
                <div className="flex space-x-2 items-center">
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      // Clear validation errors when user starts typing
                      if (validationError.isVisible) {
                        hideError();
                      }
                    }}
                    className={`bg-[#161616] border-gray-800/30 text-gray-200 font-primary focus:border-gray-700 transition-all duration-200 ease-out ${
                      projectName !== data.projectInfo.name
                        ? "flex-1"
                        : "flex-1"
                    }`}
                    disabled={isProjectUpdating}
                  />
                  <div
                    className={`transition-all duration-200 ease-out overflow-hidden ${
                      projectName !== data.projectInfo.name
                        ? "w-14 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleProjectChange(projectName, "")}
                      className=" h-10 w-10 p-0 rounded-full bg-[#161616] transition-all duration-150 ease-out border-gray-600 border-dashed hover:border-black"
                      disabled={isProjectUpdating}
                    >
                      {isProjectUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <Label
                  htmlFor="repository-url"
                  className="text-md text-gray-300 font-primary mb-2 block"
                >
                  Repository URL
                </Label>
                <div className="flex space-x-2 items-center">
                  <Input
                    id="repository-url"
                    value={repositoryUrl}
                    onChange={(e) => {
                      setRepositoryUrl(e.target.value);
                      // Clear validation errors when user starts typing
                      if (validationError.isVisible) {
                        hideError();
                      }
                    }}
                    className={`bg-[#161616] border-gray-800/30 text-gray-200 font-primary focus:border-gray-700 transition-all duration-200 ease-out ${
                      repositoryUrl !== data.projectInfo.repoUrl
                        ? "flex-1"
                        : "flex-1"
                    }`}
                    disabled={isUpdatingRepo}
                  />

                  <div
                    className={`transition-all duration-200 ease-out overflow-hidden ${
                      repositoryUrl !== data.projectInfo.repoUrl
                        ? "w-14 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleRepoChange(repositoryUrl)}
                      className=" h-10 w-10 p-0 rounded-full bg-[#161616] transition-all duration-150 ease-out border-gray-600 border-dashed hover:border-black"
                      disabled={isUpdatingRepo}
                    >
                      {isUpdatingRepo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-primary ml-3">
                  *changing the repository will update all connected
                  integrations
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team Management */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-[#0c0c0c] border border-gray-600 border-dashed rounded-lg p-6">
              <h2 className="text-4xl font-darker font-semibold mb-5">Team</h2>
              <div className="mb-5 mt-2">
                <Label className="text-md text-gray-300 font-primary block">
                  Team Members
                </Label>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 font-primary">
                    Manage project collaborators and permissions
                  </p>
                  <Dialog
                    open={isInviteDialogOpen}
                    onOpenChange={handleInviteDialogClose}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-[#161616] border-gray-600 border-dashed cursor-pointer hover:border-black text-gray-300 hover:text-black transition-all duration-150 ease-out font-primary"
                        disabled={isAddingMember}
                      >
                        {isAddingMember ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 " />
                        )}
                        add member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0c0c0c] border border-gray-600 border-dashed text-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-darker font-semibold flex items-center">
                          <Mail className="h-5 w-5 mr-2" />
                          Add Team Member
                        </DialogTitle>
                        <DialogDescription className="text-gray-300 font-primary">
                          Enter the email address of the person you'd like to
                          invite to this project.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="member-email"
                            className="text-md text-gray-300 font-primary mb-2 block"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="member-email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={memberEmail}
                            onChange={(e) => {
                              setMemberEmail(e.target.value);
                              // Clear validation errors when user starts typing
                              if (validationError.isVisible) {
                                hideError();
                              }
                            }}
                            className="bg-[#161616] border-gray-800/30 text-gray-200 font-primary focus:border-gray-700"
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
                          onClick={() => handleInviteDialogClose(false)}
                          className="bg-[#161616] border-gray-600 border-dashed cursor-pointer hover:border-black text-gray-300 hover:text-black transition-all duration-150 ease-out font-primary"
                          disabled={isAddingMember}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddMember}
                          variant="outline"
                          className="bg-[#161616] border-gray-600 border-dashed cursor-pointer hover:border-black text-gray-300 hover:text-black transition-all duration-150 ease-out font-primary"
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
                <div className="space-y-3">
                  {members.filter(Boolean).map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-4 bg-[#161616] border border-gray-800/30 rounded-lg hover:border-gray-700 transition-all duration-200 ease-out"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-primary text-gray-200">
                            {member.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-primary text-gray-200 capitalize flex items-center space-x-2">
                            <span>{member.username}</span>
                            {member.role === "OWNER" && (
                              <Badge className="bg-gray-700 text-gray-300 text-xs border-gray-600">
                                owner
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-primary">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      {member.role !== "OWNER" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#161616] border-gray-600 border-dashed hover:border-black text-gray-400 hover:text-black transition-all duration-150 ease-out"
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
                <p className="text-sm text-gray-500 font-primary ml-3 mt-3">
                  *removed members will lose access to this project immediately
                </p>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-[#0c0c0c] border border-gray-600 border-dashed rounded-lg p-6">
              <h2 className="text-4xl font-darker font-semibold mb-5 text-red-300">
                Danger Zone
              </h2>
              <div className="mb-5 mt-2">
                <Label className="text-md text-gray-300 font-primary mb-2 block">
                  Delete Project
                </Label>
                <div className="flex items-center justify-between p-4 bg-red-950/10 border border-red-900/20 rounded-lg">
                  <div>
                    <h3 className="text-sm font-primary text-gray-200 mb-1">
                      Permanently delete this project
                    </h3>
                    <p className="text-sm text-gray-500 font-primary">
                      This will permanently delete all associated data. This
                      action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={deleteProjectUpdating}
                        className="bg-red-950/20 border-red-900/30 border-dashed cursor-pointer hover:border-red-800/50 text-red-400 hover:bg-red-300 hover:text-red-800 transition-all duration-150 ease-out font-primary"
                      >
                        {deleteProjectUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        delete project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#0c0c0c] border border-gray-600 border-dashed text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-darker font-semibold flex items-center text-red-300">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Delete Project
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300 font-primary">
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
                        <AlertDialogCancel className="bg-[#161616] border-gray-600 border-dashed cursor-pointer hover:border-black text-gray-300 transition-all duration-150 ease-out font-primary">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          className="bg-red-950/20 border-red-900/30 border-dashed cursor-pointer hover:border-red-800/50 text-red-400 hover:bg-red-300 hover:text-red-800 transition-all duration-150 ease-out font-primary"
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

      {/* Error Toast */}
      <ErrorToast
        message={validationError.message}
        type={validationError.type}
        isVisible={validationError.isVisible}
        onClose={hideError}
      />
    </div>
  );
}
