import "server-only";
import { PDFArray, PDFName, PDFString, PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from "pdf-lib";
import { appConfig } from "@/src/lib/config";
import type { EvidenceItem, Report } from "@/src/lib/evidence";
import { demoEvidenceItems } from "@/src/fixtures/demo";

export function reportToHtml(report: Report, evidence: EvidenceItem[] = demoEvidenceItems) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(appConfig.brand.name)} report</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17201d; margin: 40px; line-height: 1.5; }
    a { color: #1f6f68; }
    h1, h2 { line-height: 1.2; }
    section { break-inside: avoid; margin: 0 0 28px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #d9e2de; padding: 8px; text-align: left; vertical-align: top; }
    .warning { border: 1px solid #fbbf24; background: #fffbeb; padding: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(appConfig.brand.name)} Evidence Brief</h1>
  <p class="warning">${escapeHtml(report.warning)}</p>
  <section>
    <h2>Report Context</h2>
    <p>Candidate: ${escapeHtml(report.context.candidateGithubHandle)}<br />
    Role: ${escapeHtml(report.context.jobRole)}<br />
    Version: ${escapeHtml(report.context.reportVersion)}<br />
    Generated: ${escapeHtml(report.context.reportDate.slice(0, 10))}</p>
  </section>
  <section>
    <h2>Executive Screening Brief</h2>
    <ul>${report.executiveBrief.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
  </section>
  <section>
    <h2>Requirement Matrix</h2>
    <table>
      <thead><tr><th>Requirement</th><th>Status</th><th>Confidence</th><th>Question</th></tr></thead>
      <tbody>${report.requirementMatrix
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.requirement)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.confidence)}</td><td>${escapeHtml(item.suggestedInterviewQuestion)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
  </section>
  <section>
    <h2>Evidence Links</h2>
    <ul>${evidence
      .map((item) => `<li><a href="${escapeAttribute(item.sourceUrl)}">${escapeHtml(item.id)}</a>: ${escapeHtml(item.claim)}</li>`)
      .join("")}</ul>
  </section>
</body>
</html>`;
}

export function evidenceToCsv(evidence: EvidenceItem[] = demoEvidenceItems) {
  return toCsv([
    ["id", "category", "claim", "evidenceType", "observationType", "confidence", "repositoryFullName", "path", "sourceUrl", "limitations"],
    ...evidence.map((item) => [
      item.id,
      item.category,
      item.claim,
      item.evidenceType,
      item.observationType,
      item.confidence,
      item.repositoryFullName,
      item.path ?? "",
      item.sourceUrl,
      item.limitations,
    ]),
  ]);
}

export function requirementsToCsv(report: Report) {
  return toCsv([
    ["requirement", "importance", "status", "confidence", "repositories", "evidenceIds", "limitations", "suggestedInterviewQuestion"],
    ...report.requirementMatrix.map((item) => [
      item.requirement,
      item.importance,
      item.status,
      item.confidence,
      item.repositories.join("; "),
      item.evidenceIds.join("; "),
      item.limitations,
      item.suggestedInterviewQuestion,
    ]),
  ]);
}

export async function reportToPdf(report: Report, evidence: EvidenceItem[] = demoEvidenceItems) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${appConfig.brand.name} Evidence Brief`);
  pdf.setSubject("Evidence-backed technical interview brief");
  pdf.setCreator(appConfig.brand.name);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const state: PdfWriteState = {
    pdf,
    page: pdf.addPage([612, 792]),
    font,
    bold,
    x: 48,
    y: 744,
    width: 516,
  };

  drawLine(state, `${appConfig.brand.name} Evidence Brief`, 18, bold);
  drawLine(state, `Candidate: ${report.context.candidateGithubHandle}`, 10);
  drawLine(state, `Role: ${report.context.jobRole}`, 10);
  drawLine(state, `Report version: ${report.context.reportVersion}`, 10);
  drawLine(state, `Generated: ${report.context.reportDate.slice(0, 10)}`, 10);
  moveDown(state, 12);
  drawWrapped(state, report.warning, 10, font, rgb(0.48, 0.18, 0.07));
  moveDown(state, 12);

  drawLine(state, "Executive Screening Brief", 14, bold);
  for (const item of report.executiveBrief) drawWrapped(state, `- ${item}`, 10);
  moveDown(state, 10);

  drawLine(state, "Requirement Matrix", 14, bold);
  for (const item of report.requirementMatrix) {
    drawWrapped(state, `${item.requirement}: ${item.status} (${item.confidence})`, 10, bold);
    drawWrapped(state, item.limitations, 9, font, rgb(0.37, 0.44, 0.41));
    moveDown(state, 4);
  }

  newPage(state);
  drawLine(state, "Evidence Links", 14, bold);
  for (const item of evidence) {
    drawWrapped(state, `${item.id}: ${item.claim}`, 10);
    drawLinkedLine(state, item.sourceUrl, item.sourceUrl);
    moveDown(state, 6);
  }

  return Buffer.from(await pdf.save());
}

type PdfWriteState = {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  x: number;
  y: number;
  width: number;
};

function drawLine(state: PdfWriteState, text: string, size = 10, font = state.font, color = rgb(0.09, 0.13, 0.11)) {
  ensureSpace(state, size + 8);
  state.page.drawText(text, { x: state.x, y: state.y, size, font, color });
  state.y -= size + 8;
}

function drawWrapped(state: PdfWriteState, text: string, size = 10, font = state.font, color = rgb(0.09, 0.13, 0.11)) {
  const words = text.split(/\s+/);
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > state.width && line) {
      drawLine(state, line, size, font, color);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) drawLine(state, line, size, font, color);
}

function drawLinkedLine(state: PdfWriteState, label: string, url: string) {
  ensureSpace(state, 18);
  const size = 9;
  const maxLabel = label.length > 92 ? `${label.slice(0, 89)}...` : label;
  state.page.drawText(maxLabel, {
    x: state.x,
    y: state.y,
    size,
    font: state.font,
    color: rgb(0.12, 0.44, 0.41),
  });
  const width = Math.min(state.font.widthOfTextAtSize(maxLabel, size), state.width);
  addLinkAnnotation(state, state.x, state.y - 2, width, size + 4, url);
  state.y -= size + 8;
}

function addLinkAnnotation(state: PdfWriteState, x: number, y: number, width: number, height: number, url: string) {
  const annotation = state.pdf.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(url),
    },
  });
  let annots = state.page.node.Annots();
  if (!annots) {
    annots = state.pdf.context.obj([]) as PDFArray;
    state.page.node.set(PDFName.of("Annots"), annots);
  }
  annots.push(annotation);
}

function moveDown(state: PdfWriteState, amount: number) {
  state.y -= amount;
  ensureSpace(state, amount);
}

function ensureSpace(state: PdfWriteState, needed: number) {
  if (state.y - needed > 48) return;
  newPage(state);
}

function newPage(state: PdfWriteState) {
  state.page = state.pdf.addPage([612, 792]);
  state.y = 744;
}

function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
