import {
  DocumentMetadata,
  IsoDocumentMetadata,
  PidDocumentMetadata,
  DiagramType,
} from '../types';

import getLineNumberAndPageFromText from './getLineNumberAndPageFromText';

const getPidDocumentMetaDataFromFileName = (
  fileName: string,
  unit: string,
  matchedString?: string
): PidDocumentMetadata => {
  const documentNumber = matchedString
    ? parseInt(matchedString.substring(3), 10)
    : -1;

  return {
    type: DiagramType.PID,
    name: fileName,
    unit,
    documentNumber,
  };
};

const getIsoDocumentMetaDataFromFileName = (
  fileName: string,
  unit: string,
  lineNumberAndPage: { lineNumber: string; pageNumber: number } = {
    lineNumber: '#',
    pageNumber: -1,
  }
): IsoDocumentMetadata => {
  const { lineNumber, pageNumber } = lineNumberAndPage;
  return {
    type: DiagramType.ISO,
    name: fileName,
    unit,
    lineNumber,
    pageNumber,
  };
};

export const getMetadataFromFileName = (
  fileName: string,
  unit: string
): DocumentMetadata => {
  const isoLineNumberAndText = getLineNumberAndPageFromText(fileName);
  const pidFileNameMatchArray = fileName.match(/MF_[0-9]{1,}/);

  const isIso = isoLineNumberAndText && !pidFileNameMatchArray;

  if (isIso) {
    return getIsoDocumentMetaDataFromFileName(
      fileName,
      unit,
      isoLineNumberAndText
    );
  }

  return getPidDocumentMetaDataFromFileName(
    fileName,
    unit,
    pidFileNameMatchArray?.[0]
  );
};
