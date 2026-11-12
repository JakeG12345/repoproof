import { ReportPage } from "@/src/components/pages";
import { getWorkspace } from "@/src/lib/workspace-store";

export default async function Page() {
  const workspace = await getWorkspace();
  return <ReportPage record={workspace.reports[0]} />;
}
