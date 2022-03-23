import { ParsedDocument } from '../../modules/lineReviews/types';

const getAnnotationsForLineByDocument = (
  line: string | undefined,
  document: ParsedDocument
) =>
  line === undefined
    ? document.annotations
    : document.annotations.filter((annotation) =>
        annotation.lineNumbers.includes(line)
      );

export default getAnnotationsForLineByDocument;
