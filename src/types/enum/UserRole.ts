export const UserRole = {
  GOD: "God",
  TEACHER: "Teacher",
  STUDENT: "Student",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
