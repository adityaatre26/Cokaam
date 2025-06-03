"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Plus,
  GitBranch,
  Users,
  CheckCircle,
  Circle,
  Clock,
  User,
  ExternalLink,
  Settings,
  ArrowLeft,
  Code,
  GitCommit,
  GitPullRequest,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

export default function ProjectDetail({
  params,
}: {
  params: { projectId: string };
}) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const [newTask, setNewTask] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [repoCanScroll, setRepoCanScroll] = useState(false);
  const [taskCanScroll, setTaskCanScroll] = useState(false);
  const [repoScrollPosition, setRepoScrollPosition] = useState(0);
  const [taskScrollPosition, setTaskScrollPosition] = useState(0);
  const repoContainerRef = useRef<HTMLDivElement>(null);
  const taskContainerRef = useRef<HTMLDivElement>(null);

  const project = {
    id: unwrappedParams.projectId,
    name: "mobile app redesign",
    description: "complete redesign of the mobile application with new ui/ux",
    status: "active",
    progress: 75,
  };

  const members = [
    {
      id: 1,
      name: "alex chen",
      role: "project lead",
      avatar: "AC",
      status: "online",
    },
    {
      id: 2,
      name: "sarah kim",
      role: "designer",
      avatar: "SK",
      status: "online",
    },
    {
      id: 3,
      name: "mike jones",
      role: "developer",
      avatar: "MJ",
      status: "away",
    },
    {
      id: 4,
      name: "emma davis",
      role: "developer",
      avatar: "ED",
      status: "offline",
    },
    {
      id: 5,
      name: "tom wilson",
      role: "qa engineer",
      avatar: "TW",
      status: "online",
    },
  ];

  const repoActivity = [
    {
      id: 1,
      type: "commit",
      message: "fix: authentication flow bug",
      author: "mike jones",
      time: "2 hours ago",
      branch: "main",
    },
    {
      id: 2,
      type: "pull-request",
      title: "Feature: User Profile UI",
      author: "sarah kim",
      status: "open",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "commit",
      message: "feat: add notification preferences",
      author: "emma davis",
      time: "yesterday",
      branch: "feature/notifications",
    },
    {
      id: 4,
      type: "commit",
      message: "chore: update dependencies",
      author: "alex chen",
      time: "2 days ago",
      branch: "main",
    },
    {
      id: 5,
      type: "pull-request",
      title: "Refactor: API Service Layer",
      author: "mike jones",
      status: "merged",
      time: "3 days ago",
    },
    {
      id: 6,
      type: "commit",
      message: "fix: mobile layout issues",
      author: "sarah kim",
      time: "3 days ago",
      branch: "fix/mobile-layout",
    },
    {
      id: 7,
      type: "commit",
      message: "feat: add dark mode support",
      author: "emma davis",
      time: "4 days ago",
      branch: "feature/dark-mode",
    },
    {
      id: 8,
      type: "commit",
      message: "docs: update readme with new features",
      author: "alex chen",
      time: "5 days ago",
      branch: "main",
    },
    {
      id: 9,
      type: "pull-request",
      title: "Feature: Advanced Search",
      author: "tom wilson",
      status: "open",
      time: "6 days ago",
    },
    {
      id: 10,
      type: "commit",
      message: "fix: memory leak in data processing",
      author: "emma davis",
      time: "1 week ago",
      branch: "hotfix/memory-leak",
    },
  ];

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "design new user interface",
      assignee: "sarah kim",
      status: "completed",
      priority: "high",
    },
    {
      id: 2,
      title: "implement authentication flow",
      assignee: "mike jones",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 3,
      title: "setup database schema",
      assignee: "emma davis",
      status: "completed",
      priority: "medium",
    },
    {
      id: 4,
      title: "create api endpoints",
      assignee: null,
      status: "todo",
      priority: "medium",
    },
    {
      id: 5,
      title: "write unit tests",
      assignee: "tom wilson",
      status: "in-progress",
      priority: "low",
    },
    {
      id: 6,
      title: "deploy to staging",
      assignee: null,
      status: "todo",
      priority: "low",
    },
    {
      id: 7,
      title: "implement user feedback system",
      assignee: "sarah kim",
      status: "todo",
      priority: "medium",
    },
    {
      id: 8,
      title: "optimize database queries",
      assignee: "mike jones",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 9,
      title: "add error logging",
      assignee: null,
      status: "todo",
      priority: "low",
    },
    {
      id: 10,
      title: "create user documentation",
      assignee: "alex chen",
      status: "completed",
      priority: "medium",
    },
    {
      id: 11,
      title: "implement caching layer",
      assignee: "emma davis",
      status: "todo",
      priority: "high",
    },
    {
      id: 12,
      title: "setup monitoring dashboard",
      assignee: "tom wilson",
      status: "in-progress",
      priority: "medium",
    },
  ]);

  // Sort tasks by priority (high -> medium -> low) and then by status
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const statusOrder = { "in-progress": 3, todo: 2, completed: 1 };

    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    return statusOrder[b.status] - statusOrder[a.status];
  });

  // Check if sections can scroll
  useEffect(() => {
    const checkRepoScroll = () => {
      if (repoContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } =
          repoContainerRef.current;
        setRepoCanScroll(scrollHeight > clientHeight);
        setRepoScrollPosition(scrollTop);
      }
    };

    const checkTaskScroll = () => {
      if (taskContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } =
          taskContainerRef.current;
        setTaskCanScroll(scrollHeight > clientHeight);
        setTaskScrollPosition(scrollTop);
      }
    };

    checkRepoScroll();
    checkTaskScroll();

    const repoContainer = repoContainerRef.current;
    const taskContainer = taskContainerRef.current;

    if (repoContainer) {
      repoContainer.addEventListener("scroll", checkRepoScroll);
    }
    if (taskContainer) {
      taskContainer.addEventListener("scroll", checkTaskScroll);
    }

    return () => {
      if (repoContainer) {
        repoContainer.removeEventListener("scroll", checkRepoScroll);
      }
      if (taskContainer) {
        taskContainer.removeEventListener("scroll", checkTaskScroll);
      }
    };
  }, [repoActivity, sortedTasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: tasks.length + 1,
          title: newTask,
          assignee: null,
          status: "todo",
          priority: taskPriority,
        },
      ]);
      setNewTask("");
      setTaskPriority("medium");
    }
  };

  const takeTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, assignee: "alex chen", status: "in-progress" }
          : task
      )
    );
  };

  const completeTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
  };

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
              <span className="text-gray-300 font-normal text-sm capitalize">
                {project.name}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-900/50 font-normal text-sm transition-all duration-300 hover:px-6"
              >
                <Link href={`/projects/${project.id}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors mr-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              back to dashboard
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-4 capitalize">
            {project.name}
          </h1>
          <p className="text-gray-300 font-normal mb-6">
            {project.description}
          </p>
          <div className="flex items-center space-x-4">
            <Badge
              className={`${
                project.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : project.status === "review"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {project.status}
            </Badge>
            <span className="text-gray-300 font-normal text-sm">
              {project.progress}% complete
            </span>
          </div>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Left Column - Repository Activity (3/5 width) */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extralight flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Repository Activity
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 hover:text-white border-gray-800 hover:border-gray-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                view on github
              </Button>
            </div>

            <div className="bg-gray-950/50 border border-gray-800/30 rounded-lg overflow-hidden h-[600px] flex flex-col relative">
              <div className="p-4 border-b border-gray-800/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 font-normal text-sm">
                    github.com/team/mobile-app
                  </span>
                </div>
                <Badge className="bg-[#00607a]/20 text-[#00607a] hover:bg-[#00607a]/30">
                  main
                </Badge>
              </div>

              {/* Repository Activity List with Hidden Scrollbar */}
              <div
                ref={repoContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-gray-800/30"
                style={{
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
              >
                {repoActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {activity.type === "commit" ? (
                          <GitCommit className="h-4 w-4 text-[#9a0000]" />
                        ) : (
                          <GitPullRequest
                            className={`h-4 w-4 ${
                              activity.status === "merged"
                                ? "text-[#9a0000]"
                                : "text-[#00607a]"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200 font-normal text-sm mb-1">
                          {activity.type === "commit"
                            ? activity.message
                            : activity.title}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="capitalize">{activity.author}</span>
                          <span className="mx-1">•</span>
                          <span>{activity.time}</span>
                          {activity.type === "commit" && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="text-gray-500">
                                {activity.branch}
                              </span>
                            </>
                          )}
                          {activity.type === "pull-request" && (
                            <>
                              <span className="mx-1">•</span>
                              <span
                                className={`${
                                  activity.status === "open"
                                    ? "text-[#00607a]"
                                    : "text-[#9a0000]"
                                } capitalize`}
                              >
                                {activity.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll Indicator for Repository */}
              {repoCanScroll && repoScrollPosition === 0 && (
                <motion.div
                  className="absolute bottom-4 right-4 w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-gray-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Tasks (2/5 width) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extralight flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Tasks
              </h2>
              <span className="text-sm text-gray-300 font-normal">
                {tasks.filter((t) => t.status === "completed").length}/
                {tasks.length} completed
              </span>
            </div>

            <div className="bg-gray-950/50 border border-gray-800/30 rounded-lg overflow-hidden h-[600px] flex flex-col relative">
              {/* Add Task */}
              <div className="p-4 border-b border-gray-800/30 space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="add new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    className="bg-gray-900/50 border-gray-800/30 text-gray-200 placeholder-gray-500 font-normal"
                  />
                  <Button
                    onClick={addTask}
                    className="bg-[#00607a] hover:bg-[#007a9a] text-white font-normal transition-all duration-300 hover:px-6"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Priority Selection */}
                <div>
                  <Label className="text-sm text-gray-400 font-normal mb-2 block">
                    Priority
                  </Label>
                  <RadioGroup
                    value={taskPriority}
                    onValueChange={setTaskPriority}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="high"
                        id="high"
                        className="border-[#9a0000] text-[#9a0000]"
                      />
                      <Label
                        htmlFor="high"
                        className="text-sm text-gray-300 font-normal cursor-pointer"
                      >
                        High
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="medium"
                        id="medium"
                        className="border-yellow-500 text-yellow-500"
                      />
                      <Label
                        htmlFor="medium"
                        className="text-sm text-gray-300 font-normal cursor-pointer"
                      >
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="low"
                        id="low"
                        className="border-gray-500 text-gray-500"
                      />
                      <Label
                        htmlFor="low"
                        className="text-sm text-gray-300 font-normal cursor-pointer"
                      >
                        Low
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Tasks List with Hidden Scrollbar */}
              <div
                ref={taskContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
              >
                {sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border-b border-gray-800/30 hover:bg-gray-900/30 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="mt-0.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-normal ${
                            task.status === "completed"
                              ? "text-gray-500"
                              : "text-gray-200"
                          } capitalize`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {task.assignee ? (
                            <span className="text-xs text-gray-400 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {task.assignee}
                            </span>
                          ) : (
                            <Button
                              onClick={() => takeTask(task.id)}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 hover:text-white transition-colors p-0 h-auto font-normal opacity-0 group-hover:opacity-100"
                            >
                              take task
                            </Button>
                          )}
                          <Badge
                            className={`text-xs ${
                              task.priority === "high"
                                ? "bg-[#9a0000]/20 text-[#9a0000]"
                                : task.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll Indicator for Tasks */}
              {taskCanScroll && taskScrollPosition === 0 && (
                <motion.div
                  className="absolute bottom-4 right-4 w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-gray-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Team Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extralight flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-gray-950/50 border border-gray-800/30 rounded-lg p-4 hover:bg-gray-900/30 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mb-3 relative">
                    <span className="text-xl font-normal text-gray-200">
                      {member.avatar}
                    </span>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                        member.status === "online"
                          ? "bg-green-400"
                          : member.status === "away"
                          ? "bg-yellow-400"
                          : "bg-gray-600"
                      }`}
                    ></div>
                  </div>
                  <div className="text-sm font-normal text-gray-200 capitalize">
                    {member.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
