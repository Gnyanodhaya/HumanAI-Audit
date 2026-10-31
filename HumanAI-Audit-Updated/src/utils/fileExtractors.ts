/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is configured properly if available, or use legacy worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  // Use unpkg or cdnjs worker matching version or let pdfjs run in standard fallback
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

export interface FileExtractionResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Extracts raw text from TXT, Markdown, PDF, or DOCX files
 */
export async function extractTextFromFile(file: File): Promise<FileExtractionResult> {
  const fileName = file.name;
  const fileSize = file.size;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // 10MB safety limit
  if (fileSize > 10 * 1024 * 1024) {
    throw new Error(`File is too large (${(fileSize / (1024 * 1024)).toFixed(1)}MB). Please upload documents under 10MB.`);
  }

  if (fileSize === 0) {
    throw new Error('The uploaded file is empty.');
  }

  // Handle plain text files
  if (extension === 'txt' || extension === 'md' || file.type.startsWith('text/')) {
    const text = await file.text();
    if (!text.trim()) {
      throw new Error('The text file does not contain readable characters.');
    }
    return {
      text,
      fileName,
      fileSize,
      fileType: 'TXT / Markdown'
    };
  }

  // Handle DOCX files with Mammoth
  if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (!text) {
        throw new Error('No readable text could be extracted from this Word document.');
      }
      return {
        text,
        fileName,
        fileSize,
        fileType: 'Microsoft Word (DOCX)'
      };
    } catch (err: any) {
      throw new Error(`Failed to read Word (.docx) document: ${err?.message || 'Unsupported or corrupted format'}`);
    }
  }

  // Handle PDF files with PDF.js
  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true
      });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .trim();

        if (pageText) {
          textParts.push(pageText);
        }
      }

      const fullText = textParts.join('\n\n').trim();
      if (!fullText) {
        throw new Error('This PDF appears to be scanned or contains only images without selectable text.');
      }

      return {
        text: fullText,
        fileName,
        fileSize,
        fileType: 'Adobe PDF'
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF: ${err?.message || 'Unsupported PDF stream'}`);
    }
  }

  throw new Error(`Unsupported file type (.${extension}). Please upload .txt, .md, .docx, or .pdf files.`);
}
