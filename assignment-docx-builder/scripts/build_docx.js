#!/usr/bin/env node
// Builds a COMSATS-style assignment .docx: cover page (logo + details) then the answer.
// Usage: node build_docx.js content.json output.docx

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, LevelFormat,
  HeadingLevel, Footer, PageNumber, SectionType,
} = require("docx");

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node build_docx.js content.json output.docx");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const FONT = "Times New Roman";

const student = Object.assign(
  {
    submitted_by: "Muhammad Zubair Khan",
    reg_no: "SP25-ELC-056",
    submitted_to: "Numera Sahab",
    course_title: "Ideology and Constitution of Pakistan",
    course_code: "HUM113",
  },
  cfg.student || {}
);

const date = cfg.date || "";
if (!date || /[\[\]]/.test(date)) {
  console.error("Error: 'date' is missing or still a placeholder.");
  process.exit(1);
}
if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
  console.warn(`Warning: date "${date}" is not in dd/mm/yyyy format.`);
}

// Turn "text with **bold** parts" into TextRuns.
function runs(text, extra = {}) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((p) => p.length)
    .map((p) =>
      p.startsWith("**") && p.endsWith("**")
        ? new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, ...extra })
        : new TextRun({ text: p, font: FONT, ...extra })
    );
}

// ---------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------
const cover = [];

const logoPath = path.join(__dirname, "..", "assets", "comsats_logo.png");
if (fs.existsSync(logoPath)) {
  cover.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [
        new ImageRun({
          type: "png",
          data: fs.readFileSync(logoPath),
          transformation: { width: 290, height: 290 },
          altText: { title: "Logo", description: "COMSATS University Islamabad logo", name: "logo" },
        }),
      ],
    })
  );
} else {
  console.warn("Warning: assets/comsats_logo.png not found; cover page built without a logo.");
}

// "Assignment N" title, centred, with a large gap under the logo
cover.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 240 },
    children: [new TextRun({
      text: cfg.assignment_number ? `Assignment ${cfg.assignment_number}` : "Assignment",
      bold: true, size: 36, font: FONT,
    })],
  })
);

const detailLines = [
  ["Submitted By", student.submitted_by],
  ["Reg No", student.reg_no],
  ["Submitted To", student.submitted_to],
  ["Course Title", student.course_title],
  ["Course Code", student.course_code],
];
for (const [label, value] of detailLines) {
  cover.push(
    new Paragraph({
      indent: { left: 540 },
      spacing: { after: 120 },
      children: [new TextRun({ text: `${label}: ${value}`, bold: true, size: 28, font: FONT })],
    })
  );
}

cover.push(
  new Paragraph({
    indent: { left: 540 },
    spacing: { before: 360, after: 0 },
    children: [new TextRun({ text: `Submission Date : ${date}`, bold: true, size: 28, font: FONT })],
  })
);

// ---------------------------------------------------------------
// Body (answer)
// ---------------------------------------------------------------
const numbering = [
  {
    reference: "bullets",
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  },
];
let numberedCount = 0;
const body = [];

for (const b of cfg.blocks || []) {
  switch (b.type) {
    case "question":
      body.push(new Paragraph({
        spacing: { before: 240, after: 120 }, keepNext: true,
        children: runs(b.text, { bold: true }),
      }));
      break;
    case "heading":
      body.push(new Paragraph({
        heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: b.text, font: FONT })],
      }));
      break;
    case "subheading":
      body.push(new Paragraph({
        heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: b.text, font: FONT })],
      }));
      break;
    case "bullets":
      for (const item of b.items) {
        body.push(new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 80, line: 276 },
          children: runs(item),
        }));
      }
      break;
    case "numbered": {
      const ref = `numbered-${numberedCount++}`;
      numbering.push({
        reference: ref,
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      });
      for (const item of b.items) {
        body.push(new Paragraph({
          numbering: { reference: ref, level: 0 },
          spacing: { after: 80, line: 276 },
          children: runs(item),
        }));
      }
      break;
    }
    case "paragraph":
    default:
      body.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 276 },
        children: runs(b.text),
      }));
  }
}

const page = {
  size: { width: 11906, height: 16838 }, // A4
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};

const doc = new Document({
  creator: student.submitted_by,
  title: `${student.course_code} Assignment ${cfg.assignment_number || ""}`.trim(),
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true },
        paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true },
        paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 1 },
      },
    ],
  },
  numbering: { config: numbering },
  sections: [
    // Section 1: cover page, no page number
    { properties: { page }, children: cover },
    // Section 2: the answer, numbering restarts at 1
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { ...page, pageNumbers: { start: 1 } },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: FONT, size: 20 }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
            ],
          })],
        }),
      },
      children: body.length ? body : [new Paragraph({ children: [] })],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log(`Created ${outputPath}`);
});
