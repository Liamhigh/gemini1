
import { ChatMessage, EvidenceFile } from '../types';

// Declare types for CDN libraries
declare const PDFLib: any;
declare const qrcode: any;

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateQrCode = (text: string): string => {
  const qr = qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  return qr.createDataURL(4);
};

export const sealTranscriptToPdf = async (
  messages: ChatMessage[],
  evidence: EvidenceFile[]
): Promise<{ pdfBytes: Uint8Array, sha512: string }> => {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  const pdfDoc = await PDFDocument.create();
  // FIX: Changed 'const' to 'let' to allow reassigning 'page' when a new page is created.
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // --- Document Content ---
  let transcript = `Verum Omnis - Sealed Forensic Transcript\n`;
  transcript += `Generated: ${new Date().toISOString()}\n\n---\n\n`;

  messages.forEach(msg => {
    transcript += `[${msg.role.toUpperCase()}]\n${msg.text}\n\n`;
    if (msg.rawResponses) {
        msg.rawResponses.forEach(res => {
            transcript += `  - [${res.provider} Raw]: ${res.text}\n`;
        });
        transcript += `\n`;
    }
  });

  if (evidence.length > 0) {
    transcript += `---\n\nAttached Evidence Hashes (${evidence.length} items)\n\n`;
    evidence.forEach(item => {
      transcript += `File: ${item.name}\nSHA-512: ${item.sha512}\n\n`;
    });
  }
  
  // --- Calculate SHA-512 of the transcript ---
  const textEncoder = new TextEncoder();
  const transcriptBytes = textEncoder.encode(transcript);
  const hashBuffer = await window.crypto.subtle.digest('SHA-512', transcriptBytes);
  const transcriptHash = arrayBufferToHex(hashBuffer).toUpperCase();

  // --- Draw PDF ---
  const margin = 50;
  const lineHeight = 14;
  let y = height - margin;

  // Title
  page.drawText('Verum Omnis - Sealed Forensic Transcript', { x: margin, y, font: fontBold, size: 18 });
  y -= 30;

  // Body Text
  const lines = transcript.split('\n');
  for (const line of lines) {
    if (y < margin + 50) { // Add new page if content overflows
        page.drawText('...continued on next page', { x: width / 2 - 50, y: margin - 20, font, size: 8, color: rgb(0.5, 0.5, 0.5) });
        page = pdfDoc.addPage();
        y = height - margin;
    }
    page.drawText(line, { x: margin, y, font, size: 9, lineHeight });
    y -= lineHeight;
  }
  
  // Watermark
  const watermarkText = 'Verum Omnis - Confidential';
  page.drawText(watermarkText, {
    x: width / 2 - 150,
    y: height / 2,
    font: fontBold,
    size: 50,
    color: rgb(0.85, 0.85, 0.85),
    rotate: PDFLib.degrees(45),
    opacity: 0.5,
  });

  // Footer block
  const qrDataUrl = generateQrCode(`verumomnis://verify#${transcriptHash}`);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  const qrSize = 60;
  
  page.drawRectangle({
    x: margin,
    y: margin - 10,
    width: width - margin * 2,
    height: qrSize + 20,
    color: rgb(0.95, 0.95, 0.95),
    opacity: 0.8,
  });
  
  page.drawImage(qrImage, {
      x: width - margin - qrSize,
      y: margin,
      width: qrSize,
      height: qrSize
  });

  page.drawText('✔ Patent Pending Verum Omnis', { x: margin + 10, y: margin + qrSize - 15, font: fontBold, size: 10 });
  page.drawText(`Created: ${new Date().toLocaleString()}`, { x: margin + 10, y: margin + qrSize - 30, font, size: 8 });
  page.drawText('SHA-512:', { x: margin + 10, y: margin + 15, font: fontMono, size: 6 });
  page.drawText(transcriptHash, { x: margin + 10, y: margin + 5, font: fontMono, size: 6, maxWidth: width - margin*2 - qrSize - 20 });


  const pdfBytes = await pdfDoc.save();
  return { pdfBytes, sha512: transcriptHash };
};