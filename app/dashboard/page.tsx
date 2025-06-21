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
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = [
    { label: "active projects", value: "12", change: "+3 this month" },
    { label: "team members", value: "24", change: "+2 this week" },
    { label: "repositories", value: "18", change: "+1 today" },
    { label: "tasks completed", value: "156", change: "+12 today" },
  ];

  const { user, projects, isLoading, addProject } = useUser();

  const addingProject = async () => {
    setIsCreating(true);
    try {
      const newProject = await axios.post(`/api/${user?.id}/create-project`, {
        name: projectName,
        UserId: user.id,
        repoUrl: repoUrl,
      });

      console.log("New project created:", newProject);

      if (newProject.status === 201) {
        const addData = {
          id: newProject.data.ProjectId,
          name: newProject.data.name,
        };
        addProject(addData);
        setProjectName("");
        setRepoUrl("");
        setDialogOpen(false);
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsCreating(false);
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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-[#780000] rounded-md"></div>
              <span className="text-lg font-extralight tracking-wider">
                flow
              </span>
            </Link>

            <div className="flex items-center space-x-8">
              <span className="text-gray-300 font-normal text-sm">
                welcome back, alex
              </span>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-900/50 font-normal text-sm transition-all duration-300 hover:px-6"
              >
                settings
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-4">
            Dashboard
          </h1>
          <p className="text-gray-300 font-normal">
            overview of your projects and team activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-gray-950/50 border-gray-800/30 p-6 hover:bg-gray-900/30 transition-all duration-300 min-h-[120px] flex flex-col justify-between"
            >
              <div className="text-2xl font-extralight mb-2 text-white">
                {stat.value}
              </div>
              <div className="text-gray-300 font-normal text-sm mb-1 capitalize">
                {stat.label}
              </div>
              <div className="text-gray-500 font-normal text-xs">
                {stat.change}
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extralight mb-4">Projects</h2>
              <p className="text-gray-300 font-normal">
                manage and track all your projects
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00607a] hover:bg-[#007a9a] text-white font-normal transition-all duration-300 hover:px-6 mt-6 md:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  new project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/90 backdrop-blur-md p-6 rounded-lg border border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extralight text-white">
                    Create New Project
                  </DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  <Label
                    htmlFor="project-name"
                    className="text-sm font-normal text-gray-300"
                  >
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="mt-1 bg-gray-950/50 border-gray-800/30 text-gray-200 placeholder-gray-500 font-normal focus:border-gray-700"
                  />
                </div>
                <div className="mb-6">
                  <Label
                    htmlFor="repo-url"
                    className="text-sm font-normal text-gray-300"
                  >
                    Repository URL
                  </Label>
                  <Input
                    id="repo-url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Enter repository URL"
                    className="mt-1 bg-gray-950/50 border-gray-800/30 text-gray-200 placeholder-gray-500 font-normal focus:border-gray-700"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    className="border-gray-800 text-gray-300 hover:bg-gray-900/50 hover:text-white hover:border-gray-700 font-normal transition-all duration-300"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#00607a] hover:bg-[#007a9a] text-white font-normal transition-all duration-300"
                    onClick={addingProject}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="search projects..."
                className="pl-10 bg-gray-950/50 border-gray-800/30 text-gray-200 placeholder-gray-500 font-normal focus:border-gray-700"
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-800 text-gray-300 hover:bg-gray-900/50 hover:text-white hover:border-gray-700 font-normal transition-all duration-300 hover:px-6"
            >
              <Filter className="h-4 w-4 mr-2" />
              filter
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="bg-gray-950/50 border-gray-800/30 p-6 hover:bg-gray-900/30 transition-all duration-300 group cursor-pointer h-full">
                    <h3 className="text-lg font-normal group-hover:text-white transition-colors text-gray-200 capitalize">
                      {project.name}
                    </h3>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
