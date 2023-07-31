import * as PDFJS from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

// In order to ensure documents are rendered at a high enough scale to be readable
// AND that we don't render so big to cause performance issues
// cap the minimum size of a document to be 2500px
const MIN_DOC_SIZE = 2500;

/**
 *
 * @param {string | PDFDocumentProxy} file The document scr or document itself
 * @param {number} pageNumber
 * @returns {string} Data URL
 */
export const pdfToImage = async (
  file: string | PDFDocumentProxy,
  pageNumber: number
) => {
  const isPdfExternallyLoaded = typeof file !== 'string';
  const pdf =
    typeof file === 'string' ? await PDFJS.getDocument(file).promise : file;

  const page = await pdf.getPage(pageNumber);
  const container = document.createElement('div');
  const canvas = document.createElement('canvas');
  const canvasContainer = document.body.appendChild(container);
  const context = canvas.getContext('2d');
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale =
    unscaledViewport.width < MIN_DOC_SIZE
      ? MIN_DOC_SIZE / unscaledViewport.width
      : 1;
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context!,
    viewport,
  };
  await page.render(renderContext).promise;
  canvasContainer.appendChild(canvas);
  const data = canvas.toDataURL();
  canvas.remove();
  const result = {
    data,
    info: {
      numPages: pdf.numPages,
    },
  };
  if (!isPdfExternallyLoaded) {
    pdf.destroy();
  }
  return result;
};
