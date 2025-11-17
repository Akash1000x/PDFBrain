import { PDFParse, type PageTextResult } from 'pdf-parse'

export async function getPdfContent(filePath: string): Promise<PageTextResult[]> {
  const data = new PDFParse({ url: filePath });
  const text = await data.getText();
  return text.pages;
}