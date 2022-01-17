/* eslint-disable no-underscore-dangle */

import { Document } from '../../modules/lineReviews/types';

const getAnnotationsByDocument = (document: Document) => [
  ...document._annotations.lines,
  ...document._annotations.symbolInstances,
];

export default getAnnotationsByDocument;
