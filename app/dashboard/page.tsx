"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import axios from "axios";
import { AnimatedSpan } from "@/components/AnimatedLink";
import { Github } from "lucide-react";
import StatCard from "@/components/StatCard";
import ErrorToast from "@/components/ErrorToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  sanitizeInput,
  validateGithubUrl,
  validateLength,
  validateRequired,
} from "@/utils/validation";

export default function Dashboard() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user, projects, stats, isLoading, addProject, refreshData } =
    useUser();

  const { error, handleApiError, hideError, showError } = useErrorHandler();

  const validateForm = () => {
    // Validate project name
    const nameError = validateRequired(projectName, "Project name");
    if (nameError) {
      showError(nameError, "validation");
      return false;
    }

    const nameLengthError = validateLength(projectName, 3, 50, "Project name");
    if (nameLengthError) {
      showError(nameLengthError, "validation");
      return false;
    }

    // Validate repository URL
    const repoError = validateGithubUrl(repoUrl);
    if (repoError) {
      showError(repoError, "validation");
      return false;
    }

    // Additional GitHub URL validation
    const githubUrlPattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
    if (!githubUrlPattern.test(repoUrl)) {
      showError(
        "GitHub URL must be in format: https://github.com/username/reponame",
        "validation"
      );
      return false;
    }

    // Validate description
    const descError = validateRequired(description, "Description");
    if (descError) {
      showError(descError, "validation");
      return false;
    }

    const descLengthError = validateLength(description, 10, 200, "Description");
    if (descLengthError) {
      showError(descLengthError, "validation");
      return false;
    }

    return true;
  };

  const addingProject = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const sanitizedData = {
        name: sanitizeInput(projectName),
        UserId: user.id,
        repoUrl: sanitizeInput(repoUrl),
        description: sanitizeInput(description),
      };
      const newProject = await axios.post(
        `/api/${user?.id}/create-project`,
        sanitizedData
      );

      console.log("New project created:", newProject);

      if (newProject.status === 201) {
        const addData = {
          id: newProject.data.ProjectId,
          name: newProject.data.name,
          description: newProject.data.description,
          repoUrl: newProject.data.repoUrl,
        };
        addProject(addData);
        setProjectName("");
        setRepoUrl("");
        setDescription("");
        refreshData();
        setDialogOpen(false);
      } else {
        showError("Failed to create project. Please try again.", "server");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      handleApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setRepoUrl("");
    setDescription("");
    hideError(); // Clear any existing errors when dialog closes
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-lg font-normal">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-lg font-normal">
          Please log in to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="border-b border-b-gray-500 border-dashed backdrop-blur-md sticky top-0 z-50 rounded-b-3xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-7 h-7 bg-[#780000] rounded-md" />
              <Link href="/" className="flex items-center space-x-3">
                <span className="text-lg font-extralight tracking-wider font-darker text-gray-200">
                  Cokaam
                </span>
              </Link>
            </motion.div>

            {/* Links + Buttons */}
            <motion.div
              className="flex items-center gap-6 font-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-200 font-primary text-sm">
                  Welcome Back, {user.username}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-darker font-bold">
            Dashboard
          </h1>
          <p className="text-gray-300 font-primary">
            overview of your projects and team activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatCard
            statValue={stats!.totalProjects}
            statLabel={"active projects"}
          />
          <StatCard
            statValue={stats!.totalMembers}
            statLabel={"team members"}
          />
          <StatCard
            statValue={stats!.totalTasks}
            statLabel={"tasks completed"}
          />
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl font-darker font-bold mb-0.5">
                Projects
              </h2>
              <p className="text-gray-300 font-primary text-sm">
                manage and track all your projects
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-[#11b74e]  hover:text-white font-primary hover:bg-[#11b74e] font-normal text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-[#FBEFEF]"
                >
                  <AnimatedSpan title="Create Project" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0c0c0c] backdrop-blur-md p-6 rounded-lg border border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-darker text-white">
                    Create New Project
                  </DialogTitle>
                </DialogHeader>
                <div className="mb-2">
                  <Label
                    htmlFor="project-name"
                    className="text-sm font-primary text-gray-300"
                  >
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Sample Project"
                    className="mt-2 bg-[#161616] border-gray-800/30 text-gray-200 placeholder-gray-500 placeholder:italic font-primary focus:border-gray-700"
                  />
                </div>
                <div className="mb-2">
                  <Label
                    htmlFor="repo-url"
                    className="text-sm font-primary text-gray-300"
                  >
                    Repository URL
                  </Label>
                  <Input
                    id="repo-url"
                    value={repoUrl}
                    required
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo-name"
                    className="mt-2 bg-[#161616] border-gray-800/30 text-gray-200 placeholder-gray-500 placeholder:italic font-primary focus:border-gray-700"
                  />
                </div>
                <div className="mb-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-primary text-gray-300"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Website for a sample project"
                    className="mt-2 bg-[#161616] border-gray-800/30 text-gray-200 placeholder-gray-500 placeholder:italic font-primary focus:border-gray-700"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="ghost"
                    className="bg-[#e93933] text-gray-200 hover:text-white font-primary hover:bg-[#e93933] font-primary font-medium text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-gray-500"
                    onClick={() => handleDialogClose(false)}
                    disabled={isCreating}
                  >
                    <AnimatedSpan title="Cancel" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-[#11b74e] text-gray-200 hover:text-white font-primary hover:bg-[#11b74e] font-primary font-medium text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-gray-500"
                    onClick={addingProject}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      "creating project"
                    ) : (
                      <AnimatedSpan title="Create Project" />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          {stats?.totalProjects === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 mb-8 bg-[#0c0c0c] border-2 border-dashed border-gray-600 rounded-lg shadow-inner">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#161616] mb-4">
                <Github className="w-8 h-8 text-[#11b74e]" />
              </div>
              <h3 className="text-2xl font-darker font-bold text-gray-200 mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-400 font-primary text-base mb-4 text-center max-w-md">
                Start by creating your first project. Your projects will appear
                here and help you organize your workflow.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="bg-[#0c0c0c] border-gray-500 border-dashed p-6  cursor-pointer h-full rounded-sm overflow-hidden group relative">
                      <h3 className="text-3xl font-darker font-medium group-hover:text-white transition-colors text-gray-200 capitalize">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-400 text-sm mt-1 font-primary group-hover:opacity-0 transition-all duration-300 ease-out">
                          {project.description}
                        </p>
                      )}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-11/12 h-1/2 bg-[08090a] border-1 border-gray-500 border-dashed rounded-t-lg opacity-0 blur-lg translate-y-full transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none pt-4 px-3">
                        <div className="text-sm font-primary text-gray-400 space-y-1">
                          <div>{project.repoUrl}</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <ErrorToast
        message={error.message}
        type={error.type}
        isVisible={error.isVisible}
        onClose={hideError}
      />
    </div>
  );
}
