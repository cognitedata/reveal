import { ParsedDocument } from '../../modules/lineReviews/types';

const getAnnotationsForLineByDocument = (
  line: string,
  document: ParsedDocument
) =>
  document.annotations.filter((annotation) =>
    annotation.lineNumbers.includes(line)
  );

export default getAnnotationsForLineByDocument;
