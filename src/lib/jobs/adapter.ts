import "server-only";
import { demoReport } from "@/src/lib/report-engine";

export type BackgroundJob = {
  id: string;
  type: "scan" | "refresh" | "retention";
  status: "queued" | "fetching" | "analysing" | "awaiting_review" | "failed" | "completed";
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type JobAdapter = {
  enqueue(job: Omit<BackgroundJob, "id" | "status" | "createdAt" | "updatedAt">): Promise<BackgroundJob>;
  processNext(): Promise<{ job?: BackgroundJob; reportId?: string; message: string }>;
  list(): Promise<BackgroundJob[]>;
};

const jobs: BackgroundJob[] = [];

export class DeterministicJobAdapter implements JobAdapter {
  async enqueue(job: Omit<BackgroundJob, "id" | "status" | "createdAt" | "updatedAt">) {
    const createdAt = new Date().toISOString();
    const queued: BackgroundJob = {
      ...job,
      id: `job_${jobs.length + 1}`,
      status: "queued",
      createdAt,
      updatedAt: createdAt,
    };
    jobs.push(queued);
    return queued;
  }

  async processNext() {
    const job = jobs.find((item) => item.status === "queued");
    if (!job) return { message: "No queued jobs." };
    job.status = "completed";
    job.updatedAt = new Date().toISOString();
    return {
      job,
      reportId: demoReport.id,
      message: "Deterministic mock scan completed and queued the report for human review.",
    };
  }

  async list() {
    return jobs;
  }
}

export function createJobAdapter(): JobAdapter {
  return new DeterministicJobAdapter();
}
