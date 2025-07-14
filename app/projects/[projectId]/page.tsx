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
  ChevronDown,
  GitCommit,
  Check,
  ClipboardCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  ProjectInterface,
  TaskInterface,
  CommitInterface,
  MembershipInterface,
} from "@/types/projectTypes";
import { useUser } from "@/contexts/UserContext";
import { useProject } from "@/hooks/useProject";
import LoadingScreen from "@/components/LoadingPage";
import { AnimatedLink } from "@/components/AnimatedLink";
import { sanitizeInput, validateRequired } from "@/utils/validation";
import ErrorToast from "@/components/ErrorToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface paramInterface {
  projectId: string;
}
export default function ProjectDetail({ params }: { params }) {
  // Unwrap params using React.use()
  const { user, isAuthenticated } = useUser();
  const unwrappedParams: paramInterface = React.use(params);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [repoCanScroll, setRepoCanScroll] = useState(false);
  const [taskCanScroll, setTaskCanScroll] = useState(false);
  const [repoScrollPosition, setRepoScrollPosition] = useState(0);
  const [taskScrollPosition, setTaskScrollPosition] = useState(0);
  const repoContainerRef = useRef<HTMLDivElement>(null);
  const taskContainerRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<ProjectInterface | null>(null);
  const [members, setMembers] = useState<MembershipInterface[]>([]);
  const [tasks, setTasks] = useState<TaskInterface[]>([]);
  const [commit, setCommits] = useState<CommitInterface[]>([]);
  const { data, isLoading } = useProject(unwrappedParams.projectId);

  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [isAssigningTask, setIsAssigningTask] = useState<string | null>(null);
  const [isCompletingTask, setIsCompletingTask] = useState<string | null>(null);

  const { error, handleApiError, hideError, showError } = useErrorHandler();

  const sortedTasks = (tasksTosSort: TaskInterface[]) => {
    return [...tasksTosSort].sort((a, b) => {
      return (a.status === "DONE" ? 1 : 0) - (b.status === "DONE" ? 1 : 0);
    });
  };

  useEffect(() => {
    if (data) {
      console.log("Data from react query", data);
      setProject(data.projectInfo);
      setMembers(data.members);
      setTasks(sortedTasks(data.activeTasks));
      setCommits(data.recentCommits);
    }
  }, [data]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);

    socket.on("connect", () => {
      socket.emit("join_project", unwrappedParams.projectId);
      console.log(
        "Connected to socket server and joined project:",
        unwrappedParams.projectId
      );
    });

    socket.on("new_commit", (data) => {
      console.log("New commit received: ", data);

      setCommits((prevActivity) => [
        {
          id: data.commitId,
          type: "commit",
          message: data.message,
          author: data.author,
          branch: data.branch,
          timestamp: data.timestamp || new Date().toISOString(),
        },
        ...prevActivity,
      ]);
    });

    socket.on("new_task", (data) => {
      console.log("New task received: ", data);

      setTasks((prevTasks) => [
        {
          TaskId: data.task.TaskId,
          title: data.task.title,
          description: data.task.description,
          createdAt: new Date(data.task.createdAt),
          updatedAt: new Date(data.task.updatedAt),
          priority: data.task.priority,
          status: data.task.status,
          assignee: null, // Assuming no assignee for simplicity
          creator: data.task.creator,
        },
        ...prevTasks,
      ]);
    });

    socket.on("task_assigned", (data) => {
      console.log("Task assigned event received: ", data);
      if (data.assignee === null) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.TaskId === data.taskId
              ? {
                  ...task,
                  assignee: null,
                  status: data.status,
                }
              : task
          )
        );

        console.log("Updated to null now, nothing is assigned");
        return;
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.TaskId === data.taskId
            ? {
                ...task,
                assignee: {
                  UserId: data.assignee.UserId,
                  username: data.assignee.username,
                },
                status: data.status,
              }
            : task
        )
      );
    });

    socket.on("task_completed", (data) => {
      console.log("Task completed event received: ", data);
      setTasks((prevTasks) => {
        // Step 1: Create a new array with the task's status updated to "DONE".
        const updatedTasks = prevTasks.map((task) =>
          task.TaskId === data.taskId
            ? {
                ...task,
                status: "DONE",
                assignee: {
                  UserId: data.UserId,
                  username: data.assignee,
                },
              }
            : task
        );
        // Step 2: Sort the newly updated array and return it to update the state.
        return sortedTasks(updatedTasks);
      });
    });

    return () => {
      socket.disconnect(); // This automatically leaves all rooms
    };
  }, [unwrappedParams.projectId]); // Put projectId back in dependency array

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
  }, [commit, tasks]);

  const validateForm = () => {
    const titleError = validateRequired(newTask, "Task title");
    if (titleError) {
      showError(titleError, "validation");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setNewTask("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    hideError();
  };

  const addTask = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (user === null) {
        console.error("User is not authenticated");
        return;
      }
      if (!project) {
        console.error("Project is not loaded");
        return;
      }
      console.log(
        "Sending request to ",
        `/api/projects/${project?.projectId}/add-task`
      );
      setIsAddingTask(true);
      const response = await axios.post(
        `/api/projects/${project?.projectId}/add-task`,
        {
          title: sanitizeInput(newTask),
          description: sanitizeInput(taskDescription),
          priority: taskPriority,
          UserId: user?.id,
        }
      );

      if (response.data.status === "success") {
        // Reset form
        setNewTask("");
        setTaskDescription("");
        setTaskPriority("MEDIUM");

        // Update tasks list
        setTasks((prevTasks) => [...prevTasks, response.data.data]);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      handleApiError(error);
    } finally {
      setIsAddingTask(false);
      resetForm();
    }
  };

  const assignTask = async (taskId: string) => {
    try {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        return;
      }
      const task = tasks.find((t) => t.TaskId === taskId);
      console.log(task?.status, user?.id, task?.assignee?.UserId);
      if (!task || (task.assignee && task.assignee.UserId !== user?.id)) {
        console.error(
          "Task cannot be assigned - either not found, not in progress, or not assigned to current user"
        );
        return;
      }

      console.log(user?.id, taskId);

      setIsAssigningTask(taskId);
      const response = await axios.post(
        `/api/projects/${project?.projectId}/assign-task`,
        {
          taskId,
          UserId: user?.id,
        }
      );

      console.log(response);
    } catch (error) {
      console.error("Error assigning task:", error);
    } finally {
      setIsAssigningTask(null);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        return;
      }

      // console.log(taskId, user?.id);

      setIsCompletingTask(taskId);
      const result = await axios.post(
        `/api/projects/${unwrappedParams.projectId}/complete-task`,
        {
          taskId,
          userId: user?.id,
        }
      );

      console.log("Updated successfully", result.data);
    } catch (error) {
      console.log("Error completing task:", error);
    } finally {
      setIsCompletingTask(null);
    }
  };

  function formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

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
              <span className="text-gray-300 font-primary text-sm mt-0.5 capitalize">
                {project?.name}
              </span>
            </motion.div>

            {/* Links + Buttons */}
            <motion.div
              className="flex items-center gap-6 font-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="bg-[#08090a] text-gray-200 hover:text-white hover:bg-[#1a1b1e] font-normal text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-gray-500 "
                >
                  <Settings className="h-4 w-4" />
                  <AnimatedLink
                    href={`/projects/${project?.projectId}/settings`}
                    title="settings"
                  />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-6">
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
          <h1 className="text-4xl md:text-7xl font-darker font-medium tracking-tight mb-0.5 capitalize">
            {project?.name}
          </h1>
          <p className="text-gray-300 font-primary mb-6 ml-2">
            {project?.description}
          </p>
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
              <h2 className="text-3xl font-darker flex items-center ">
                <GitBranch className="h-5 w-5 mr-2 mt-2" />
                Repository Activity
              </h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-800 transition-all duration-200 ease-out mt-2 font-primary"
              >
                <a
                  href={project?.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 " />
                  view on github
                </a>
              </Button>
            </div>

            {commit.length === 0 ? (
              <div className="flex flex-col items-center h-[90%] justify-center py-24 mb-8 bg-[#0c0c0c] border border-dashed border-gray-600 rounded-lg shadow-inner">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#161616] mb-4">
                  <GitCommit className="w-8 h-8 text-[#11b74e]" />
                </div>
                <h3 className="text-2xl font-darker font-bold text-gray-200 mb-2">
                  No Commits Yet
                </h3>
                <p className="text-gray-400 font-primary text-base mb-4 text-center max-w-md">
                  Start by commiting to your repository. Your commits will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="bg-[#111111] border border-gray-500 border-dashed rounded-lg overflow-hidden h-[600px] flex flex-col relative">
                <div className="p-4 border-b border-gray-800/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 font-primary text-sm">
                      {project?.repoUrl?.slice(8)}
                    </span>
                  </div>
                  <Badge className="bg-[#00607a]/20 text-[#00607a] hover:bg-[#00607a]/30">
                    main
                  </Badge>
                </div>

                {/* Repository Activity List with Hidden Scrollbar */}
                <div
                  ref={repoContainerRef}
                  className="flex-1 overflow-y-auto scrollbar-hide divide-y space-y-2 pb-2"
                  style={{
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE/Edge
                  }}
                >
                  {commit.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "#1a1a1a",
                        borderColor: "#444",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                      }}
                      className="py-4 px-4 rounded-lg bg-[#202020] hover:bg-[#1a1a1a] transition-all border border-gray-700 hover:border-gray-500 relative pl-10 mx-2 group"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-5 w-3 h-3 bg-[#9a0000] rounded-full border-2 border-[#202020] z-10"></div>

                      {/* Timeline pulse animation */}
                      <motion.div
                        className="absolute left-4 top-5 w-3 h-3 bg-[#9a0000] rounded-full"
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.3, 0, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />

                      <div>
                        <p className="text-gray-200 text-sm font-primary mb-1 group-hover:text-white transition-colors">
                          {activity.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-400 mt-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="font-primary">
                              {activity.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-500 font-primary">
                              {activity.branch}
                            </span>
                          </div>
                          {/* Add timestamp here */}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-500 font-primary">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
            )}
          </motion.div>

          {/* Right Column - Tasks (2/5 width) */}
          {/* Right Column - Tasks (2/5 width) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-darker flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 mt-2" />
                To-Do
              </h2>
              <span className="text-sm text-gray-400 font-primary mt-2">
                {tasks?.length || 0} open tasks
              </span>
            </div>

            <div className="bg-[#111111] border border-gray-500 mt-7 border-dashed rounded-lg overflow-hidden h-[600px] flex flex-col relative">
              {/* Add Task Form Area */}
              <div className="p-4 border-b border-gray-700/60 bg-gradient-to-b from-[#1c1c1c]/50 to-transparent space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    className="bg-[#0a0a0a] border-gray-700/60 placeholder:italic text-gray-200 placeholder-gray-500 font-primary focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00607a]/70 focus-visible:border-[#00607a]"
                  />
                  <Button
                    onClick={addTask}
                    disabled={isAddingTask}
                    size="icon"
                    className="bg-[#0a0a0a] hover:bg-[#e0e0e0] group border-1 border-gray-700/60 rounded-full text-white font-normal transition-all duration-300 flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Plus
                      className={`h-4 w-4 group-hover:text-black transition-all duration-300 ease-out ${
                        isAddingTask
                          ? "animate-spin text-gray-400"
                          : " group-hover:rotate-90"
                      }`}
                    />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Add a description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="bg-[#0a0a0a] border-gray-700/60 text-gray-300 placeholder-gray-500 placeholder:italic text-sm font-primary focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00607a]/70 focus-visible:border-[#00607a]"
                  />
                  <RadioGroup
                    value={taskPriority}
                    onValueChange={setTaskPriority}
                    className="flex space-x-6 pt-1"
                  >
                    <div className="flex items-center space-x-2 group">
                      <RadioGroupItem
                        value="HIGH"
                        id="high"
                        className="h-4 w-4 border-gray-600 cursor-pointer data-[state=checked]:border-red-500 data-[state=checked]:text-red-500 text-red-500 focus:ring-red-500 focus-visible:ring-offset-0 group-hover:ring-2 group-hover:ring-red-500 group-hover:shadow-[0_0_8px_2px_rgba(220,38,38,0.6)] transition-all duration-150"
                      />
                      <Label
                        htmlFor="high"
                        className="text-sm text-gray-300 font-primary cursor-pointer"
                      >
                        High
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 group">
                      <RadioGroupItem
                        value="MEDIUM"
                        id="medium"
                        className="h-4 w-4 border-gray-600 cursor-pointer data-[state=checked]:border-yellow-500 data-[state=checked]:text-yellow-500 text-yellow-500 focus:ring-yellow-500 focus-visible:ring-offset-0 group-hover:ring-2 group-hover:ring-yellow-400 group-hover:shadow-[0_0_8px_2px_rgba(250,204,21,0.6)] transition-all duration-150"
                      />
                      <Label
                        htmlFor="medium"
                        className="text-sm text-gray-300 font-primary cursor-pointer"
                      >
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 group">
                      <RadioGroupItem
                        value="LOW"
                        id="low"
                        className="h-4 w-4 border-gray-600 cursor-pointer data-[state=checked]:border-gray-400 data-[state=checked]:text-gray-400 text-gray-400 focus:ring-gray-400 focus-visible:ring-offset-0 group-hover:ring-2 group-hover:ring-gray-400 group-hover:shadow-[0_0_8px_2px_rgba(156,163,175,0.6)] transition-all duration-150"
                      />
                      <Label
                        htmlFor="low"
                        className="text-sm text-gray-300 font-primary cursor-pointer"
                      >
                        Low
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Tasks List Area */}
              <div
                ref={taskContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide py-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tasks?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#161616] mb-4 border border-dashed border-gray-600">
                      <ClipboardCheck className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-darker font-bold text-gray-200 mb-1">
                      All Tasks Completed
                    </h3>
                    <p className="text-gray-400 font-primary text-sm max-w-xs">
                      Add a new task above to get your project moving.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks?.map((task) => (
                      <motion.div
                        key={task.TaskId}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        whileHover={
                          task.status === "DONE"
                            ? {}
                            : {
                                backgroundColor: "#1a1a1a",
                                borderColor: "#444",
                                boxShadow: "0 4px 15px -2px rgba(0, 0, 0, 0.4)",
                              }
                        }
                        className={`p-3 rounded-lg bg-[#202020] transition-all border border-gray-700 hover:border-gray-600 relative pl-10 mx-2 group ${
                          task.status === "DONE"
                            ? "pointer-events-none"
                            : "hover:border-gray-600"
                        }`}
                      >
                        {/* Status Indicator (Top Aligned) */}
                        <motion.button
                          onClick={() => completeTask(task.TaskId)}
                          disabled={isCompletingTask === task.TaskId}
                          className={`absolute left-3 top-[13px] flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 disabled:cursor-not-allowed ${
                            isCompletingTask === task.TaskId
                              ? "animate-pulse"
                              : ""
                          }`}
                          whileHover={
                            isCompletingTask === task.TaskId
                              ? {}
                              : { scale: 1.15 }
                          }
                          whileTap={
                            isCompletingTask === task.TaskId
                              ? {}
                              : { scale: 0.95 }
                          }
                          style={{
                            backgroundColor:
                              task.status === "DONE" ? "#11b74e" : "#202020",
                            borderColor:
                              isCompletingTask === task.TaskId
                                ? "#f59e0b"
                                : task.status === "IN_PROGRESS"
                                ? "#f59e0b"
                                : task.status === "DONE"
                                ? "#11b74e"
                                : "#6b7280",
                          }}
                        >
                          {task.status === "DONE" && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                          {task.status === "IN_PROGRESS" && (
                            <Clock className="h-3 w-3 text-yellow-400" />
                          )}
                          {task.status === "TODO" && (
                            <Circle className="h-2 w-2 text-gray-500" />
                          )}
                        </motion.button>

                        <div className="flex flex-col h-full justify-between ml-2">
                          {/* Top Section: Title & Description */}
                          <div>
                            <p
                              className={`text-gray-200 text-sm font-primary group-hover:text-white transition-colors ${
                                task.status === "DONE" ? "opacity-50" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p
                                className={`text-xs text-gray-400 mt-1 font-primary ${
                                  task.status === "DONE" ? "opacity-50" : ""
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Bottom Section: Assignee & Priority */}
                          <div className="flex items-center justify-between mt-3">
                            {task.assignee ? (
                              <div
                                onClick={() => assignTask(task.TaskId)}
                                className={`text-xs text-gray-400 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors ${
                                  task.status === "DONE" ? "opacity-50" : ""
                                } ${
                                  isAssigningTask === task.TaskId
                                    ? "pointer-events-none"
                                    : ""
                                }`}
                              >
                                <User className="h-3.5 w-3.5" />

                                <span
                                  className={`font-primary capitalize ${
                                    task.status === "DONE" ? "opacity-50" : ""
                                  } ${
                                    isAssigningTask === task.TaskId
                                      ? "opacity-70"
                                      : ""
                                  }`}
                                >
                                  {isAssigningTask === task.TaskId
                                    ? "Updating..."
                                    : task.assignee.username}
                                </span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => assignTask(task.TaskId)}
                                disabled={isAssigningTask === task.TaskId}
                                variant="ghost"
                                size="sm"
                                className={`text-xs text-gray-400 h-auto px-2 py-1 hover:text-white transition-colors font-primary hover:bg-gray-700/50 disabled:opacity-70 disabled:cursor-not-allowed ${
                                  isAssigningTask === task.TaskId
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              >
                                Assign to me
                              </Button>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs font-semibold px-2 py-0.5 border-dashed ${
                                task.priority === "HIGH"
                                  ? "border-red-500/50 text-red-500 bg-red-500/10"
                                  : task.priority === "MEDIUM"
                                  ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                  : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                              } ${task.status === "DONE" ? "opacity-50" : ""}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scroll Indicator for Tasks */}
              {taskCanScroll &&
                taskScrollPosition === 0 &&
                tasks.length > 0 && (
                  <motion.div
                    className="absolute bottom-4 right-4 w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-gray-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
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
          <div className="mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 mt-2" />
            <h2 className="text-3xl font-darker ">Team Members</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {members.map((member) => (
              <div
                key={member.userId}
                className="bg-[#111111] border border-gray-700 border-dashed rounded-lg p-4 hover:bg-gray-900/30 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16  rounded-full flex items-center justify-center relative">
                    <UserRound className="h-10 w-10 font-normal text-gray-200" />
                  </div>
                  <div className="text-md font-primary text-gray-200">
                    {member.username}
                  </div>
                  <div className="text-md text-gray-400 mt-1 font-darker font-semibold tracking-wide">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
