export interface ProjectInterface {
  projectId: string;
  name: string;
  description: string | null;
  repoUrl: string;
}

export interface MembershipInterface {
  role: "OWNER" | "MEMBER";

  userId: string;
  username: string;
}

export interface CommitInterface {
  id: string;
  message: string;
  author: string;
  branch: string;
  timestamp: Date;
}

enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

// enum Priority {
//   LOW = "LOW",
//   MEDIUM = "MEDIUM",
//   HIGH = "HIGH",
// }

export interface TaskInterface {
  TaskId: string;
  title: string;
  status: Status;
  priority: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    UserId: string;
    username: string;
  } | null;
  creator: {
    UserId: string;
    username: string;
  };
}
