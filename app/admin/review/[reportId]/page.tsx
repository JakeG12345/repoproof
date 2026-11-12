import { ReviewPage } from "@/src/components/pages";
import { getReportRecord, getWorkspace } from "@/src/lib/workspace-store";

export default async function Page({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const workspace = await getWorkspace();
  const record = getReportRecord(workspace, reportId);
  return <ReviewPage workspace={workspace} record={record} admin />;
}
