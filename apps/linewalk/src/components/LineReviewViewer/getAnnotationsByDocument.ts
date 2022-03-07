import { ParsedDocument } from '../../modules/lineReviews/types';

const getAnnotationsForLineByDocument = (document: ParsedDocument) =>
  document.annotations;
export default getAnnotationsForLineByDocument;
