import { JobsPage } from "@/src/components/pages";
import { getRole, getWorkspace } from "@/src/lib/workspace-store";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const workspace = await getWorkspace();
  const role = getRole(workspace, jobId);
  return <JobsPage workspace={workspace} role={role} />;
}
