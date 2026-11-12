import { InvitePage } from "@/src/components/pages";
import { getWorkspace, isInvitationExpired } from "@/src/lib/workspace-store";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const workspace = await getWorkspace();
  const invite = workspace.candidateInvitations.find((item) => item.token === token);
  return <InvitePage workspace={workspace} token={token} expired={isInvitationExpired(invite?.expiresAt)} />;
}
