import {
  DocumentMetadata,
  IsoDocumentMetadata,
  PidDocumentMetadata,
  DocumentType,
} from '../types';

import getLineNumberAndPageFromText from './getLineNumberAndPageFromText';

const getPidDocumentMetaDataFromFileName = (
  fileName: string,
  unit: string,
  matchedString?: string
) => {
  const documentNumber = matchedString
    ? parseInt(matchedString.substring(3), 10)
    : -1;

  return {
    type: DocumentType.pid,
    name: fileName,
    unit,
    documentNumber,
  } as PidDocumentMetadata;
};

const getIsoDocumentMetaDataFromFileName = (
  fileName: string,
  unit: string,
  lineNumberAndPage: { lineNumber: string; pageNumber: number } = {
    lineNumber: '#',
    pageNumber: -1,
  }
) => {
  const { lineNumber, pageNumber } = lineNumberAndPage;
  return {
    type: DocumentType.isometric,
    name: fileName,
    unit,
    lineNumber,
    pageNumber,
  } as IsoDocumentMetadata;
};

export const getMetadataFromFileName = (
  fileName: string,
  selectedDocumentType: DocumentType = DocumentType.unknown
) => {
  const isoLineNumberAndText = getLineNumberAndPageFromText(fileName);
  const pidFileNameMatchArray = fileName.match(/MF_[0-9]{1,}/);

  const unitMatchArray = fileName.match(/G[0-9]{4}/);
  const unit = unitMatchArray ? unitMatchArray[0] : 'Unknown';

  const isPid =
    selectedDocumentType === DocumentType.pid ||
    (pidFileNameMatchArray && !isoLineNumberAndText);

  const isIso =
    selectedDocumentType === DocumentType.isometric ||
    (isoLineNumberAndText && !pidFileNameMatchArray);

  if (isPid) {
    return getPidDocumentMetaDataFromFileName(
      fileName,
      unit,
      pidFileNameMatchArray?.[0]
    );
  }
  if (isIso) {
    return getIsoDocumentMetaDataFromFileName(
      fileName,
      unit,
      isoLineNumberAndText
    );
  }
  return {
    type: DocumentType.unknown,
    name: fileName,
    unit,
  } as DocumentMetadata;
};
