import { Rect, SvgPath } from '../types';

import { lineWalkSymbolTypes } from './constants';

// Every line found in the Diagram Parsing Tool, will be uploaded in CDF with this information:
export interface ParsedDocumentsForLine {
  externalId: string; // external id of this document (probably redundant since it would be same as the file name)
  line: string; // I.e. L029
  parsedDocuments: string[]; // external id to CDF files with format of `ParsedDocument` (should be the same as `ParsedDocument.externalId`)
}

export interface ParsedDocument {
  externalId: string; // external id of this document (probably redundant since it would be same as the file name)
  pdfExternalId: string; // external id of the PDF in CDF
  type: 'p&id' | 'iso';
  annotations: Annotation[];
  potentialDiscrepancies: PotentialDiscrepancies[];
  linking: DocumentLink[];
  viewBox: Rect;
}

export interface PotentialDiscrepancies {
  // Hypothesis is that we only need P&ID annotation ids. Linking to ISO will be done by frontend via linking property?
  annotationIds: AnnotationId[];
  description: string; // Inconsisent valve diameter
}

export interface DocumentLink {
  from: AnnotationId;
  to: AnnotationId;
}

export interface AnnotationId {
  documentId: string; // points to `ParsedDocument.pdfExternalId`
  annotationId: string; // something like 'path1986-path1990-path1992-path1994'
}

export type LineWalkSymbolType = typeof lineWalkSymbolTypes[number];

export type LineWalkAnnotaionType = LineWalkSymbolType | 'text';

interface AnnotationBase {
  id: string; // Unique per parsed document (not globally unique)
  type: LineWalkAnnotaionType;
  boundingBox: Rect;
  svgPaths: SvgPath[];
  nearestAssetExternalIds: string[];
  lineNumbers: string[];
}

export interface TextAnnotation extends AnnotationBase {
  text: string;
}

export interface SymbolAnnotation extends AnnotationBase {
  labelIds: string[]; // not used by LineWalk current but might be used for CMD+F or auto complete discrepancies messages
}

export type Annotation = TextAnnotation | SymbolAnnotation;
