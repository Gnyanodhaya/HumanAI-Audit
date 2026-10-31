/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { AuditReport } from '../types/audit.ts';

export function generateAuditPdf(report: AuditReport, userEmail?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Helper to check page bounds and auto-add pages
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top subtle bar
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(margin, 8, contentWidth, 1.5, 'F');

    // Bottom footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `HumanAI Audit Linguistic Report • ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Confidential & Deterministic Analysis`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  };

  drawHeaderFooter();

  // 1. Header & Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('HumanAI Linguistic Audit Report', margin, y + 6);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    `Audited Document: ${report.fileName || 'Pasted Manuscript'} • ${new Date(report.timestamp).toLocaleString()}`,
    margin,
    y + 2
  );
  if (userEmail) {
    doc.text(`Auditor Account: ${userEmail}`, margin, y + 7);
    y += 5;
  }
  y += 8;

  // 2. Executive Score Banner
  checkPageBreak(38);
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  // Grade pill
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin + 4, y + 4, 26, 26, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(report.quality.grade, margin + 17, y + 17, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('GRADE', margin + 17, y + 24, { align: 'center' });

  // Score details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Writing Quality Score: ${report.quality.overallScore} / 100`, margin + 35, y + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const splitVerdict = doc.splitTextToSize(report.quality.verdict, contentWidth - 42);
  doc.text(splitVerdict, margin + 35, y + 16);

  // Quick stats line
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Words: ${report.wordStats.totalWords}   |   Sentences: ${report.sentences.totalSentences}   |   Consensus Grade: ${report.readability.consensusGradeLevel}   |   Burstiness CV: ${report.sentences.coefficientOfVariation}`,
    margin + 35,
    y + 28
  );
  y += 40;

  // Helper section title
  const addSectionTitle = (title: string) => {
    checkPageBreak(12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin, y + 4);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);
    y += 11;
  };

  // 3. Writing Quality Pillars
  addSectionTitle('1. Writing Quality Pillars');
  checkPageBreak(25);
  const pillars = [
    { name: 'Readability & Flow (30%)', score: `${report.quality.subscores.readabilityAndFlow}/100` },
    { name: 'Lexical Diversity (25%)', score: `${report.quality.subscores.lexicalDiversity}/100` },
    { name: 'Structural Rhythm (20%)', score: `${report.quality.subscores.structuralRhythm}/100` },
    { name: 'Conciseness & Clarity (15%)', score: `${report.quality.subscores.concisenessAndClarity}/100` },
    { name: 'Mechanics & Balance (10%)', score: `${report.quality.subscores.mechanicsAndBalance}/100` }
  ];

  doc.setFontSize(8.5);
  pillars.forEach((p, idx) => {
    const colX = margin + (idx % 2 === 0 ? 0 : contentWidth / 2 + 5);
    const rowY = y + Math.floor(idx / 2) * 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(p.name, colX, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(p.score, colX + 68, rowY, { align: 'right' });
  });
  y += Math.ceil(pillars.length / 2) * 8 + 5;

  // 4. Readability Formulas
  addSectionTitle('2. Readability Formulas Breakdown');
  checkPageBreak(35);
  const readabilityData = [
    ['Flesch Reading Ease', `${report.readability.fleschReadingEase} / 100`, report.readability.readingEaseLabel],
    ['Flesch-Kincaid Grade', `Grade ${report.readability.fleschKincaidGrade}`, `Age ~${Math.round(report.readability.fleschKincaidGrade + 5)}+`],
    ['Gunning Fog Index', `Fog ${report.readability.gunningFog}`, report.readability.gunningFog > 12 ? 'Academic / Complex' : 'Accessible'],
    ['Coleman-Liau Index', `Grade ${report.readability.colemanLiau}`, 'Letter-based formula'],
    ['SMOG Index', `Grade ${report.readability.smogIndex}`, `${report.wordStats.polysyllabicWords} polysyllables`],
    ['Automated Readability (ARI)', `Grade ${report.readability.automatedReadabilityIndex}`, 'Typewriter metric']
  ];

  readabilityData.forEach(([metric, val, note], idx) => {
    checkPageBreak(8);
    const colX = margin + (idx % 2 === 0 ? 0 : contentWidth / 2 + 5);
    const rowY = y + Math.floor(idx / 2) * 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(metric, colX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(val, colX + 50, rowY);
    doc.setTextColor(100, 116, 139);
    doc.text(`(${note})`, colX + 70, rowY);
  });
  y += Math.ceil(readabilityData.length / 2) * 8 + 6;

  // 5. Vocabulary & Lexical Diversity
  addSectionTitle('3. Vocabulary & Lexical Metrics');
  checkPageBreak(24);
  const vocabStats = [
    `Type-Token Ratio (TTR): ${report.vocabulary.typeTokenRatio}`,
    `Root TTR (Guiraud): ${report.vocabulary.rootTTR}`,
    `Lexical Density: ${report.vocabulary.lexicalDensity}% (${report.vocabulary.contentWordCount} content words)`,
    `Hapax Legomena (Unique once): ${report.vocabulary.hapaxLegomenaCount} (${report.vocabulary.hapaxPercentage}%)`,
    `Average Word Length: ${report.wordStats.averageWordLength} chars`,
    `Average Syllables / Word: ${report.wordStats.averageSyllablesPerWord}`
  ];

  vocabStats.forEach((stat, idx) => {
    const colX = margin + (idx % 2 === 0 ? 0 : contentWidth / 2 + 5);
    const rowY = y + Math.floor(idx / 2) * 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(stat, colX, rowY);
  });
  y += Math.ceil(vocabStats.length / 2) * 7 + 6;

  // 6. Sentence & Cadence (Burstiness)
  addSectionTitle('4. Sentence Cadence & Stylometrics');
  checkPageBreak(26);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Average Sentence Length: ${report.sentences.averageSentenceLength} words`, margin, y);
  doc.text(`Sentence Length StdDev: ${report.sentences.sentenceLengthStdDev} words`, margin + contentWidth / 2, y);
  y += 6;
  doc.text(`Burstiness (CV): ${report.sentences.coefficientOfVariation}`, margin, y);
  doc.text(`Cadence Uniformity: ${report.quality.stylometricTendency.cadenceUniformity}`, margin + contentWidth / 2, y);
  y += 6;
  doc.text(`Min / Max Length: ${report.sentences.minSentenceLength} / ${report.sentences.maxSentenceLength} words`, margin, y);
  doc.text(`Transition Signposts: ${report.paragraphs.totalTransitionsFound} (${report.paragraphs.transitionsPerParagraph}/para)`, margin + contentWidth / 2, y);
  y += 10;

  // 7. Repetition & Cliché Warnings
  addSectionTitle('5. Repetition & Cliché Analysis');
  checkPageBreak(20);
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Repetition Index: ${report.repetition.repetitionIndex}/100`, margin, y);
  doc.text(`Stock Clichés Detected: ${report.repetition.clicheAndFillerHits.length}`, margin + contentWidth / 2, y);
  y += 6;

  if (report.repetition.clicheAndFillerHits.length > 0) {
    report.repetition.clicheAndFillerHits.slice(0, 4).forEach(hit => {
      checkPageBreak(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(225, 29, 72);
      doc.text(`• "${hit.phrase}" (${hit.count}x):`, margin + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(hit.suggestion, margin + 45, y);
      y += 5.5;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text('✓ No stock AI clichés or excessive filler phrases detected.', margin + 3, y);
    y += 6;
  }
  y += 4;

  // 8. Actionable Recommendations
  addSectionTitle('6. Actionable Linguistic Recommendations');
  report.quality.recommendations.forEach(rec => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`• [${rec.category}] ${rec.message}`, margin, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`  Action: ${rec.action}`, margin, y);
    y += 6;
  });

  // Save the PDF file
  const filename = `humanai-linguistic-audit-${Date.now()}.pdf`;
  doc.save(filename);
}
