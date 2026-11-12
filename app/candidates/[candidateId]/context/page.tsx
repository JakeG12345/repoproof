import { CandidatesPage } from "@/src/components/pages";
import { getCandidate, getWorkspace } from "@/src/lib/workspace-store";

export default async function Page({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const workspace = await getWorkspace();
  const candidate = getCandidate(workspace, candidateId);
  return <CandidatesPage workspace={workspace} candidate={candidate} context />;
}
