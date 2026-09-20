/**
 * utils/pdfGenerator.ts
 * Pure TypeScript PDF document generator for TravelGenie itineraries.
 * Generates a valid standard PDF (PDF-1.4) directly in the browser with zero external dependencies.
 */

export interface ItineraryPdfData {
  destination: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  travelers?: string | number;
  budget?: string;
  itineraryContent: string;
  transportDetails?: string;
  accommodationDetails?: string;
  safetyInfo?: string;
}

/**
 * Extracts trip metadata (destination, dates, duration, travelers, budget) from conversation messages.
 */
export function extractTripMetadata(messages: Array<{ role: string; content: string }>, defaultDestination: string): {
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  travelers: string;
  budget: string;
} {
  const fullText = messages.map((m) => m.content).join("\n");

  let destination = defaultDestination || "India";
  let startDate = "";
  let endDate = "";
  let duration = "";
  let travelers = "";
  let budget = "";

  // Extract Dates (e.g. "12 Oct 2026", "2026-10-15", "10th to 15th Nov", etc.)
  const dateMatch =
    fullText.match(/(?:from|dates?|start(?:ing)?(?:\s+date)?[:\s]+)([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+[0-9]{4})?|[0-9]{4}-[0-9]{2}-[0-9]{2})/i) ||
    fullText.match(/([0-9]{1,2}\s+[A-Za-z]+(?:\s+[0-9]{4})?)\s+to\s+([0-9]{1,2}\s+[A-Za-z]+(?:\s+[0-9]{4})?)/i);

  if (dateMatch) {
    startDate = dateMatch[1] || "";
    endDate = dateMatch[2] || "";
  }

  // Extract Duration (e.g. "4 days", "3 nights / 4 days", "1 week")
  const durationMatch =
    fullText.match(/([0-9]+\s*(?:days?|nights?)(?:\s*\/\s*[0-9]+\s*(?:days?|nights?))?)/i) ||
    fullText.match(/([0-9]+\s*week(?:s)?)/i);
  if (durationMatch) {
    duration = durationMatch[1];
  }

  // Extract Travelers (e.g. "2 travelers", "family of 4", "solo", "2 people")
  const travelersMatch =
    fullText.match(/([0-9]+\s*(?:travelers?|people|persons?|adults?|passengers?))/i) ||
    fullText.match(/\b(solo|couple|family of [0-9]+)\b/i);
  if (travelersMatch) {
    travelers = travelersMatch[1];
  }

  // Extract Budget (e.g. "₹25,000", "Rs. 30000", "50k budget", "luxury", "budget")
  const budgetMatch =
    fullText.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+(?:k|lac|lakh)?)/i) ||
    fullText.match(/(?:budget|estimate)[:\s]+(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:k|lac|lakh)?|\b[a-zA-Z-]+\b)/i);
  if (budgetMatch) {
    budget = budgetMatch[0];
  }

  return {
    destination: destination.replace(/^Trip to\s+/i, ""),
    startDate: startDate || "Flexible / Specified in plan",
    endDate: endDate || "Specified in plan",
    duration: duration || "Custom duration",
    travelers: travelers || "2 Travelers",
    budget: budget || "Estimated standard fare",
  };
}

/**
 * Clean text for standard PDF encoding (strips unsupported non-ASCII or replaces with safe equivalents)
 */
function sanitizePdfText(text: string): string {
  return text
    .replace(/[—–]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/₹/g, "INR ")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Formats multi-line text wrapping by maximum character width.
 */
function wrapText(text: string, maxCharsPerLine: number = 80): string[] {
  const lines: string[] = [];
  const rawLines = text.split(/\r?\n/);

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Generates and triggers download of a standardized PDF document.
 */
export function downloadItineraryPdf(data: ItineraryPdfData): void {
  const destination = data.destination || "Custom Indian Tour";
  const filename = `TravelGenie-${destination.replace(/[^a-zA-Z0-9]/g, "_")}-Itinerary.pdf`;

  // Build the text stream for the PDF
  const lines: string[] = [];

  // Title Banner
  lines.push("================================================================================");
  lines.push("                          TRAVELGENIE - AI TRAVEL CONCIERGE                     ");
  lines.push("                         Verified Pan-India Itinerary Plan                      ");
  lines.push("================================================================================");
  lines.push("");

  // Trip Summary Box
  lines.push("--------------------------------------------------------------------------------");
  lines.push(` DESTINATION : ${destination.toUpperCase()}`);
  if (data.duration) lines.push(` DURATION    : ${data.duration}`);
  if (data.startDate || data.endDate) {
    lines.push(` DATES       : ${data.startDate || "TBD"} to ${data.endDate || "TBD"}`);
  }
  if (data.travelers) lines.push(` TRAVELERS   : ${data.travelers}`);
  if (data.budget) lines.push(` BUDGET      : ${data.budget}`);
  lines.push(` GENERATED   : ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");

  // Day by day itinerary content
  lines.push("--------------------------------------------------------------------------------");
  lines.push("                          COMPLETE DAY-BY-DAY ITINERARY                         ");
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");

  // Process and wrap main itinerary
  const cleanContent = data.itineraryContent
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1");

  const wrappedItinerary = wrapText(cleanContent, 82);
  lines.push(...wrappedItinerary);
  lines.push("");

  // Optional Transport / Stays / Safety sections
  if (data.transportDetails) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push("                           TRANSIT & ROUTE OPTIONS                              ");
    lines.push("--------------------------------------------------------------------------------");
    lines.push(...wrapText(data.transportDetails, 82));
    lines.push("");
  }

  if (data.accommodationDetails) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push("                          ACCOMMODATIONS & VERIFIED STAYS                       ");
    lines.push("--------------------------------------------------------------------------------");
    lines.push(...wrapText(data.accommodationDetails, 82));
    lines.push("");
  }

  if (data.safetyInfo) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push("                           SAFETY & TRAVEL ADVISORY                             ");
    lines.push("--------------------------------------------------------------------------------");
    lines.push(...wrapText(data.safetyInfo, 82));
    lines.push("");
  }

  // Footer Disclaimer
  lines.push("================================================================================");
  lines.push(" Verified by TravelGenie AI Travel Concierge · Official IRCTC / Airline Rates Apply");
  lines.push(" Need live booking support? Visit your TravelGenie dashboard to reserve this trip.");
  lines.push("================================================================================");

  // Paginate lines into pages of ~54 lines each
  const linesPerPage = 52;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push(["No itinerary content available."]);

  // Construct PDF Objects
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  const objects: string[] = [];

  // Object 1: Catalog (will point to Pages at object 2)
  // Object 2: Pages (kids: [page objects])
  // Object 3: Font (Helvetica)
  // Object 4: Font (Courier)
  // Pages and Contents will follow

  let currentObjId = 5;
  for (let p = 0; p < pages.length; p++) {
    pageObjectIds.push(currentObjId++);
    contentObjectIds.push(currentObjId++);
  }

  // 1: Catalog
  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;

  // 2: Pages
  const kidsStr = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${pages.length} >>\nendobj`;

  // 3: Font Helvetica
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`;

  // 4: Font Courier (Monospace for clean alignment)
  objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj`;

  // Build each Page and its Content stream
  for (let p = 0; p < pages.length; p++) {
    const pageId = pageObjectIds[p];
    const contentId = contentObjectIds[p];
    const pageLines = pages[p];

    // Build PDF content stream with positioning
    let streamText = "BT\n";
    streamText += "/F2 9.5 Tf\n"; // Courier 9.5pt
    streamText += "12 TL\n"; // 12pt line leading
    streamText += "40 780 Td\n"; // Top left margin (x=40, y=780)

    for (let l = 0; l < pageLines.length; l++) {
      const sanitized = sanitizePdfText(pageLines[l]);
      if (l === 0) {
        streamText += `(${sanitized}) Tj\n`;
      } else {
        streamText += `T* (${sanitized}) Tj\n`;
      }
    }

    // Page number at bottom
    streamText += "T*\n";
    streamText += `T* (                    Page ${p + 1} of ${pages.length} - TravelGenie AI Concierge) Tj\n`;
    streamText += "ET\n";

    const streamLength = streamText.length;

    // Content Object
    objects[contentId] = `${contentId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}endstream\nendobj`;

    // Page Object
    objects[pageId] = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj`;
  }

  // Assemble full PDF with xref table
  let pdfOutput = "%PDF-1.4\n";
  const offsets: number[] = [];
  offsets[0] = 0;

  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdfOutput.length;
    pdfOutput += objects[i] + "\n";
  }

  const xrefOffset = pdfOutput.length;
  pdfOutput += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let i = 1; i < objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdfOutput += `${offsetStr} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Create Blob and trigger immediate browser download
  const blob = new Blob([pdfOutput], { type: "application/pdf" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1500);
}
