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
  // GitPullRequest,
  ChevronDown,
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
// import { useProject } from "@/contexts/ProjectContext";

interface paramInterface {
  projectId: string;
}
export default function ProjectDetail({ params }: { params }) {
  // Unwrap params using React.use()
  const { user, isAuthenticated } = useUser();
  // const { setProjectData } = useProject();
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
  const { data } = useProject(unwrappedParams.projectId);

  useEffect(() => {
    if (data) {
      console.log("Data from react query", data);
      setProject(data.projectInfo);
      setMembers(data.members);
      setTasks(data.activeTasks);
      setCommits(data.recentCommits);
    }
  }, [data]);

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error loading project</div>;

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
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.TaskId !== data.taskId)
      );
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

  const addTask = async () => {
    try {
      if (newTask.trim()) {
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
        const response = await axios.post(
          `/api/projects/${project?.projectId}/add-task`,
          {
            title: newTask,
            description: taskDescription,
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
      }
    } catch (error) {
      console.error("Error adding task:", error);
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
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        return;
      }

      // console.log(taskId, user?.id);

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
    }
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
                {project?.name}
              </span>
            </div>

            {data?.projectInfo.ownerId === user?.id && (
              <div className="flex items-center space-x-4">
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-gray-900/50 font-normal text-sm transition-all duration-300 hover:px-6"
                >
                  <Link href={`/projects/${project?.projectId}/settings`}>
                    <Settings className="h-4 w-4 mr-2" />
                    settings
                  </Link>
                </Button>
              </div>
            )}
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
            {project?.name}
          </h1>
          <p className="text-gray-300 font-normal mb-6">
            {project?.description}
          </p>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            <span className="text-gray-300 font-normal text-sm">
              23% complete
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
                {commit.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        <GitCommit className="h-4 w-4 text-[#9a0000]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200 font-normal text-sm mb-1">
                          {activity.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="capitalize">{activity.author}</span>
                          <span className="mx-1">•</span>
                          {/* <span>{activity.time}</span> */}
                          {/* {activity.type === "commit" && ( */}
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-gray-500">
                              {activity.branch}
                            </span>
                          </>
                          {/* )} */}
                          {/* {activity.type === "pull-request" && (
                            <>
                              <span className="mx-1">•</span>
                            </>
                          )} */}
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
                {tasks?.filter((t) => t.status === "DONE")?.length || 0}/
                {tasks?.length || 0} completed
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

                {/* Task Description */}
                <div>
                  <Label className="text-sm text-gray-400 font-normal mb-2 block">
                    Description
                  </Label>
                  <Input
                    placeholder="task description..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="bg-gray-900/50 border-gray-800/30 text-gray-200 placeholder-gray-500 font-normal"
                  />
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
                        value="HIGH"
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
                        value="MEDIUM"
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
                        value="LOW"
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
                {tasks?.map((task) => (
                  <div
                    key={task.TaskId}
                    className="p-4 border-b border-gray-800/30 hover:bg-gray-900/30 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => completeTask(task.TaskId)}
                        className="mt-0.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {task.status === "DONE" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : task.status === "IN_PROGRESS" ? (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-normal ${
                            task.status === "DONE"
                              ? "text-gray-500"
                              : "text-gray-200"
                          } capitalize`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {task.assignee ? (
                            <span
                              onClick={() => assignTask(task.TaskId)}
                              className="text-xs text-gray-400 flex items-center cursor-pointer hover:text-white transition-colors"
                            >
                              <User className="h-3 w-3 mr-1" />
                              {task.assignee.username}
                            </span>
                          ) : (
                            <Button
                              onClick={() => assignTask(task.TaskId)}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 hover:text-white transition-colors p-0 h-auto font-normal opacity-0 group-hover:opacity-100"
                            >
                              take task
                            </Button>
                          )}
                          <Badge
                            className={`text-xs ${
                              task.priority === "HIGH"
                                ? "bg-[#9a0000]/20 text-[#9a0000]"
                                : task.priority === "MEDIUM"
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
                key={member.userId}
                className="bg-gray-950/50 border border-gray-800/30 rounded-lg p-4 hover:bg-gray-900/30 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mb-3 relative">
                    <span className="text-xl font-normal text-gray-200">
                      PP
                    </span>
                  </div>
                  <div className="text-sm font-normal text-gray-200 capitalize">
                    {member.username}
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
