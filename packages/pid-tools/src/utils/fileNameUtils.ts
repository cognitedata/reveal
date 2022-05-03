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
) => {
  const documentNumber = matchedString
    ? parseInt(matchedString.substring(3), 10)
    : -1;

  return {
    type: DiagramType.pid,
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
    type: DiagramType.isometric,
    name: fileName,
    unit,
    lineNumber,
    pageNumber,
  } as IsoDocumentMetadata;
};

export const getMetadataFromFileName = (
  fileName: string,
  selectedDiagramType: DiagramType = DiagramType.unknown
) => {
  const isoLineNumberAndText = getLineNumberAndPageFromText(fileName);
  const pidFileNameMatchArray = fileName.match(/MF_[0-9]{1,}/);

  const unitMatchArray = fileName.match(/G[0-9]{4}/);
  const unit = unitMatchArray ? unitMatchArray[0] : 'Unknown';

  const isPid =
    selectedDiagramType === DiagramType.pid ||
    (pidFileNameMatchArray && !isoLineNumberAndText);

  const isIso =
    selectedDiagramType === DiagramType.isometric ||
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
    type: DiagramType.unknown,
    name: fileName,
    unit,
  } as DocumentMetadata;
};
