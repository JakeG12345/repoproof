import { ScanPage } from "@/src/components/pages";
import { getWorkspace } from "@/src/lib/workspace-store";

export default async function Page({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const workspace = await getWorkspace();
  const scan = workspace.scans.find((item) => item.id === scanId);
  return <ScanPage workspace={workspace} scan={scan} />;
}
