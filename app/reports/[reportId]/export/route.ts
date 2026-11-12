import { evidenceToCsv, reportToHtml, reportToPdf, requirementsToCsv } from "@/src/lib/exports";
import { getReportRecord, getWorkspace } from "@/src/lib/workspace-store";

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext<"/reports/[reportId]/export">) {
  const { reportId } = await context.params;
  const workspace = await getWorkspace();
  const record = getReportRecord(workspace, reportId);
  if (!record) {
    return new Response("Report not found", { status: 404 });
  }

  const { report, evidence } = record;
  const format = new URL(request.url).searchParams.get("format") ?? "html";

  if (format === "pdf") {
    const pdf = await reportToPdf(report, evidence);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="repoproof-${report.id}.pdf"`,
      },
    });
  }

  if (format === "evidence_csv") {
    return new Response(evidenceToCsv(evidence), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="repoproof-${report.id}-evidence.csv"`,
      },
    });
  }

  if (format === "requirements_csv") {
    return new Response(requirementsToCsv(report), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="repoproof-${report.id}-requirements.csv"`,
      },
    });
  }

  return new Response(reportToHtml(report, evidence), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
