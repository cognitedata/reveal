type Error = {
  startsWith: string;
  translation: string;
};

export const ERRORS: { [key: string]: Error } = {
  FAILED_TO_PARSE: {
    startsWith: "Error from file conversion 'module' object is not callable",
    translation: 'This file cannot be contextualized. Try another file.',
  },
  TOO_MANY_PAGES: {
    startsWith: 'Error from file conversion The PDF file should have at most',
    translation:
      'This file has too many pages. Use a PDF file that has less than 50 pages.',
  },
  TYPE_NOT_SUPPORTED: {
    startsWith: 'File mimeType not supported. Currently support only',
    translation:
      'This mime type is not supported. Use a PDF file or an image with JPEG, PNG, or TIFF format.',
  },
  EMPTY_FILE: {
    startsWith: 'This file is empty',
    translation: 'There is an error in this file. Try again with a new file.',
  },
  SVG_TIME_OUT: {
    startsWith: 'File conversion timed out',
    translation: 'SVG conversion timed out. Unable to create SVG.',
  },
  SVG_BAD: {
    startsWith: 'Unable to create SVG',
    translation: 'Unable to create SVG. Try again with another file.',
  },
  FILE_TOO_BIG: {
    startsWith: 'The file size is above the limit',
    translation: 'The file size is above the limit. Use a smaller file.',
  },
};

export const ERROR_GENERIC: string = 'An unknown error occured.';
