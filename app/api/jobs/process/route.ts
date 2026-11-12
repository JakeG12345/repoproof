import { createJobAdapter } from "@/src/lib/jobs/adapter";

export async function GET() {
  const result = await createJobAdapter().processNext();
  return Response.json(result);
}

export async function POST() {
  const result = await createJobAdapter().processNext();
  return Response.json(result);
}
