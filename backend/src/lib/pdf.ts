import { IGeneratedPaper } from '@/models/GeneratedPaper';
import { IAssignment } from '@/models/Assignment';
import puppeteer from 'puppeteer';

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#15803d' },
  medium: { label: 'Moderate', color: '#a16207' },
  hard: { label: 'Challenging', color: '#b91c1c' },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(assignment: IAssignment, paper: IGeneratedPaper): string {
  const subject = escapeHtml(assignment.subject || assignment.title);
  const className = escapeHtml(assignment.className || '—');
  const totalMarks = assignment.totalMarks;

  let computedMarks = 0;
  for (const section of paper.sections) {
    for (const q of section.questions) {
      computedMarks += q.marks || 0;
    }
  }
  const displayMarks = computedMarks || totalMarks;

  const hasAnswerKey = paper.sections
    .flatMap((s) => s.questions)
    .some((q) => Boolean(q.correctAnswer));

  // Build sections HTML
  let sectionsHtml = '';
  let globalIndex = 0;
  for (const section of paper.sections) {
    let questionsHtml = '';
    for (const q of section.questions) {
      globalIndex++;
      const diff = DIFFICULTY_LABEL[q.difficulty] || { label: q.difficulty, color: '#525252' };
      const markLabel = q.marks === 1 ? 'Mark' : 'Marks';

      let optionsHtml = '';
      if (q.options && q.options.length > 0) {
        const optionItems = q.options
          .map((opt, oi) => `<li>${String.fromCharCode(97 + oi)}) ${escapeHtml(opt)}</li>`)
          .join('');
        optionsHtml = `<ol class="options">${optionItems}</ol>`;
      }

      questionsHtml += `
        <li class="question">
          <span class="q-num">${globalIndex}.</span>
          <span class="q-body">
            <span class="diff" style="color:${diff.color}">[${diff.label}]</span>
            ${escapeHtml(q.text)}
            <span class="marks">[${q.marks} ${markLabel}]</span>
            ${optionsHtml}
          </span>
        </li>`;
    }

    sectionsHtml += `
      <div class="section">
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        <p class="section-label">${escapeHtml(getSectionLabel(section.title))}</p>
        <p class="section-instruction">${escapeHtml(section.instruction)}</p>
        <ol class="questions">${questionsHtml}</ol>
      </div>`;
  }

  // Build answer key HTML
  let answerKeyHtml = '';
  if (hasAnswerKey) {
    let answerItems = '';
    let aIdx = 0;
    for (const section of paper.sections) {
      for (const q of section.questions) {
        aIdx++;
        if (q.correctAnswer) {
          answerItems += `
            <li class="answer-item">
              <span class="a-num">${aIdx}.</span>
              <span class="a-body">${escapeHtml(q.correctAnswer)}</span>
            </li>`;
        }
      }
    }
    answerKeyHtml = `
      <div class="answer-key">
        <h3 class="answer-key-title">Answer Key:</h3>
        <ol class="answers">${answerItems}</ol>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1a1a;
    padding: 48px 56px;
    font-size: 13px;
    line-height: 1.6;
  }
  .header {
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .header p {
    font-size: 14px;
    font-weight: 600;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 600;
  }
  .compulsory {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .student-info {
    margin-bottom: 24px;
    font-size: 13px;
    line-height: 2;
  }
  .student-info .line {
    display: inline-block;
    border-bottom: 1px solid #1a1a1a;
    margin-left: 4px;
  }
  .section {
    margin-bottom: 28px;
  }
  .section-title {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }
  .section-label {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 2px;
  }
  .section-instruction {
    font-size: 12px;
    font-style: italic;
    color: #5e5e5e;
    margin-bottom: 10px;
  }
  .questions {
    list-style: none;
    padding: 0;
  }
  .question {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.5;
  }
  .q-num { font-weight: 500; flex-shrink: 0; }
  .q-body { flex: 1; }
  .diff { font-weight: 600; }
  .marks { color: #5e5e5e; font-weight: 500; }
  .options {
    list-style: none;
    padding: 0;
    margin-top: 6px;
    margin-left: 16px;
    font-size: 12px;
  }
  .options li { margin-bottom: 3px; }
  .end-text {
    font-size: 13px;
    font-weight: bold;
    margin-top: 16px;
    margin-bottom: 32px;
  }
  .answer-key {
    border-top: 1px solid #e0e0e0;
    padding-top: 24px;
  }
  .answer-key-title {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 16px;
  }
  .answers {
    list-style: none;
    padding: 0;
  }
  .answer-item {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.5;
  }
  .a-num { font-weight: 500; flex-shrink: 0; }
  .a-body { flex: 1; }
</style>
</head>
<body>
  <div class="header">
    <h1>Delhi Public School, Sector-4, Bokaro</h1>
    <p>Subject: ${subject}</p>
    <p>Class: ${className}</p>
  </div>
  <div class="meta">
    <span>Time Allowed: 45 minutes</span>
    <span>Maximum Marks: ${displayMarks}</span>
  </div>
  <p class="compulsory">All questions are compulsory unless stated otherwise.</p>
  <div class="student-info">
    <div>Name: <span class="line" style="width:160px"></span></div>
    <div>Roll Number: <span class="line" style="width:112px"></span></div>
    <div>Class: ${className} Section: <span class="line" style="width:80px"></span></div>
  </div>
  ${sectionsHtml}
  <p class="end-text">End of Question Paper</p>
  ${answerKeyHtml}
</body>
</html>`;
}

function getSectionLabel(sectionTitle: string): string {
  const t = sectionTitle.toLowerCase();
  if (t.includes('section a')) return 'Short Answer Questions';
  if (t.includes('section b')) return 'Long Answer Questions';
  return 'Questions';
}

export const generateQuestionPaperPdf = async (assignment: IAssignment, paper: IGeneratedPaper): Promise<Buffer> => {
  const html = buildHtml(assignment, paper);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }
};
