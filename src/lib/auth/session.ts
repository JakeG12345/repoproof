import "server-only";

export type SessionUser = {
  id: string;
  email: string;
  organisationId: string;
  role: "owner" | "admin" | "reviewer" | "recruiter";
};

export async function getCurrentUser(): Promise<SessionUser> {
  return {
    id: "user_demo",
    email: "recruiter@example.com",
    organisationId: "org_demo",
    role: "admin",
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!["owner", "admin", "reviewer"].includes(user.role)) {
    throw new Error("Admin access required.");
  }
  return user;
}
