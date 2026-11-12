import { InterviewPage } from "@/src/components/pages";
import { getReportRecord, getWorkspace } from "@/src/lib/workspace-store";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ duration?: string }>;
}) {
  const { reportId } = await params;
  const { duration } = await searchParams;
  const workspace = await getWorkspace();
  const record = getReportRecord(workspace, reportId);
  const safeDuration = duration === "15" || duration === "30" || duration === "45" || duration === "60" ? duration : "30";
  return <InterviewPage record={record} duration={safeDuration} />;
}
