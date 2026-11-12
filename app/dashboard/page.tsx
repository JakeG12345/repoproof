import { DashboardPage } from "@/src/components/pages";
import { getWorkspace } from "@/src/lib/workspace-store";

export default async function Page() {
  const workspace = await getWorkspace();
  return <DashboardPage workspace={workspace} />;
}
