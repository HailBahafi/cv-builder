declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; [key: string]: unknown };
    jsPDF?: { unit?: string; format?: string | [number, number]; orientation?: string };
    [key: string]: unknown;
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
    output(type: string, options?: unknown): Promise<unknown>;
  }

  function html2pdf(): Html2Pdf;

  export default html2pdf;
}
