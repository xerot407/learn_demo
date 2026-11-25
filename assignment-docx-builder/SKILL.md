---
name: assignment-docx-builder
description: Turns an assignment image or text into a ready-to-submit Word document with a COMSATS cover page and an original answer. Use whenever the user sends an assignment, homework or task to complete.
---

# Assignment to Word Document

The user (Muhammad Zubair Khan, COMSATS University Islamabad) sends the same kind of task again and again: a picture of an assignment. This skill removes the repeated work. Read the assignment, write a good original answer, and deliver one Word file that has the standard cover page followed by the answer.

## Cover page (always the same)

The first page of every assignment is a cover page, laid out like this:

1. The COMSATS University Islamabad logo, centred at the top
2. A large gap
3. **Assignment N**, centred and bold
4. Left-aligned bold lines under it, in this order:
   - Submitted By
   - Reg No
   - Submitted To
   - Course Title
   - Course Code
5. A little extra space, then **Submission Date : dd/mm/yyyy**

The answer starts on page 2. The cover page has no page number; the answer pages are numbered from 1.

The bundled script builds all of this, including the logo (`assets/comsats_logo.png`). Do not recreate the cover page by hand.

## Student details (defaults)

Use these on the cover page unless the assignment image clearly shows different ones.

| Field | Default |
|---|---|
| Submitted By | Muhammad Zubair Khan |
| Reg No | SP25-ELC-056 |
| Submitted To | Numera Sahab |
| Course Title | Ideology and Constitution of Pakistan |
| Course Code | HUM113 |
| Submission Date | Today's date, written dd/mm/yyyy (see Step 3) |

If the image shows a different course title, course code or teacher, use what the image shows and mention the change in one line in your reply. The user takes several courses, so the sheet is more reliable than the defaults.

If the user says the Reg No is wrong or gives a different one, use theirs for this assignment and ask whether to treat it as the new default.

## Workflow

### Step 1: Read the assignment carefully

Look at the whole image before writing anything. Pull out:

- The question(s) or task(s), word for word
- The assignment number, if there is one
- Marks, word limit, page limit, required headings or format
- Any instructions printed on the sheet (these are rules to follow, not content to copy into the answer)

If part of the image is cut off or unreadable and it affects what you should write, say what is missing and ask the user for that part. Do not guess at a question you cannot read.

### Step 2: Find the assignment number

- If the number appears on the sheet ("Assignment 2", "Assignment No. 3"), use it.
- If it does not appear anywhere, ask the user: "Which assignment number is this?" Wait for the answer before building the file. The number is the headline of the cover page, and a wrong number is more annoying than a short question.

### Step 3: Get the submission date

Use today's date from the conversation context and write it as `dd/mm/yyyy`, for example `22/11/2026`. This is the format on the user's cover pages. If you are unsure of the date, run `date "+%d/%m/%Y"` in the sandbox. Never leave a placeholder such as "[current date]" in the document.

### Step 4: Write the answer

The sheet's standing instructions are usually the same: proper English, careful grammar, no plagiarism, submit as MS Word. Treat them as requirements:

- **Write everything in original wording.** Explain ideas as you would to a teacher, in your own sentences. Do not paste or closely mirror text from books, websites or search results. Plagiarism checks are strict, and a copied answer can be rejected outright.
- **Use correct, natural English.** Full sentences, consistent tense, no slang, no broken phrasing. Re-read the answer once for grammar before building the file.
- **Match the task.** If a question asks to "discuss", give explanation with reasons. If it asks to "list" or "define", be concise. Answer every part of every question.
- **Respect limits.** If a word or page limit is given, stay within it. If none is given, aim for a thorough answer that fits the marks: roughly 300 to 500 words for a short question, 800 to 1200 for a long or multi-part one.
- **Structure for the reader.** Use a clear introduction, body sections with short headings where they help, and a brief conclusion for essay-style answers. Use bullet points only when the content is really a list.
- **Be accurate.** For Ideology and Constitution of Pakistan, be careful with names, dates, article numbers and historical events. If you are not sure of a specific fact (an exact date or article number), leave it out or phrase it generally rather than risk a wrong detail. Do not invent references or quotations. Only add a references section if the assignment asks for one, and only cite sources you are confident exist.

### Step 5: Build the Word document

Read `/mnt/skills/public/docx/SKILL.md` for the docx tooling notes, then use the bundled builder script so every assignment looks the same.

1. Write a JSON file describing the document (format below).
2. Find the script folder if you are not sure where this skill is installed:
   ```bash
   find / -name build_docx.js -path "*assignment-docx-builder*" 2>/dev/null
   ```
3. Run it:
   ```bash
   node <skill-folder>/scripts/build_docx.js content.json /mnt/user-data/outputs/<file-name>.docx
   ```
   The script looks for the logo at `<skill-folder>/assets/comsats_logo.png`. If it prints a warning that the logo is missing, tell the user the cover page has no logo.
4. Name the file like `HUM113_Assignment_3_Zubair.docx` (course code, assignment number, first name). If there is no number yet, ask first (Step 2).

**JSON format**

```json
{
  "assignment_number": "3",
  "date": "22/11/2026",
  "student": { "course_title": "...", "course_code": "..." },
  "blocks": [
    { "type": "question", "text": "Q1. Discuss the Two-Nation Theory." },
    { "type": "heading", "text": "Introduction" },
    { "type": "paragraph", "text": "Body text. Use **double asterisks** for bold." },
    { "type": "bullets", "items": ["First point", "Second point"] },
    { "type": "numbered", "items": ["Step one", "Step two"] }
  ]
}
```

- `student` is optional. Include only the fields that differ from the defaults. Its keys are `submitted_by`, `reg_no`, `submitted_to`, `course_title`, `course_code`.
- Block types: `question` (bold question line), `heading`, `subheading`, `paragraph`, `bullets`, `numbered`.
- Do not put the cover page details in `blocks`; the script writes the cover page itself.

The answer pages use an A4 page, Times New Roman 12 pt, justified paragraphs and a page number in the footer.

### Step 6: Check and deliver

1. Render the file to images and look at them (the docx skill shows the commands). Confirm the logo shows, the cover details are complete and in the right order, the date is in dd/mm/yyyy format, and the answer starts on page 2.
2. Present the file with `present_files`.
3. Reply briefly: which assignment number and date you used, anything you changed from the defaults, and one sentence suggesting the user read through the answer so they can explain it if the teacher asks about it. Keep the reply short; the file is the deliverable.

## Things to avoid

- Do not leave `[current date]`, `[assignment number]` or any bracketed placeholder in the final file.
- Do not copy the sheet's instruction bullets into the answer.
- Do not change the cover page layout, add borders or decoration, or add extra cover pages.
- Do not pad the answer with filler to reach a length. Quality and accuracy matter more than word count.
