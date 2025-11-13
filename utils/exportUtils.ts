// utils/exportUtils.ts

export function exportHtmlToWord(htmlContent: string, filename: string) {
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
        <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 1in; line-height: 1.5; }
            h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; line-height: 1.2; }
            h1 { font-size: 24pt; text-align: center; }
            h2 { font-size: 18pt; }
            h3 { font-size: 16pt; }
            h4 { font-size: 14pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; }
            ul { list-style-type: disc; margin-left: 20px; }
            ol { list-style-type: decimal; margin-left: 20px; }
            p { margin-bottom: 0.5em; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; }
            .ml-4 { margin-left: 16px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-primary { border-color: #10B981; } /* Emerald */
            .text-primary { color: #10B981; }
            .text-secondary { color: #60A5FA; } /* Blue */
            .bg-blue-50 { background-color: #eff6ff; }
            .border-blue-200 { border-color: #bfdbfe; }
            .text-blue-800 { color: #1e40af; }
            .bg-green-100 { background-color: #d1fae5; }
            .text-green-800 { color: #065f46; }

            /* Page breaks for sections in PPM */
            .section-break { page-break-before: always; }
        </style>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>
  `;

  const blob = new Blob([fullHtml], {
    type: 'application/msword',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
