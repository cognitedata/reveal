import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';
import {
  PidDocumentMetadata,
  IsoDocumentMetadata,
  DocumentMetadata,
  DocumentType,
  VALID_LINE_NUMBER_PREFIXES,
} from '@cognite/pid-tools';

import { fetchFileByExternalId } from './api';

const fileNameLooksLikeIso = (fileName: string) => {
  const prefixOptionsString = VALID_LINE_NUMBER_PREFIXES.join('|');
  const isoRegex = new RegExp(`(${prefixOptionsString})[0-9]{1,}-[0-9]{1,}`);
  return fileName.match(isoRegex);
};

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
  matchedString?: string
) => {
  const lineParts = matchedString ? matchedString.split('-') : undefined;
  const lineNumber = lineParts ? lineParts[0] : '#';
  const pageNumber = lineParts ? parseInt(lineParts[1], 10) : '#';

  return {
    type: DocumentType.isometric,
    name: fileName,
    unit,
    lineNumber,
    pageNumber,
  } as IsoDocumentMetadata;
};

const getMetadataFromFile = (
  file: File,
  selectedDocumentType: DocumentType = DocumentType.unknown
) => {
  const { name } = file;

  const isoFileNameMatchArray = fileNameLooksLikeIso(name);
  const pidFileNameMatchArray = name.match(/MF_[0-9]{1,}/);

  const unitMatchArray = file.name.match(/G[0-9]{4}/);
  const unit = unitMatchArray ? unitMatchArray[0] : 'Unknown';

  const isPid =
    selectedDocumentType === DocumentType.pid ||
    (pidFileNameMatchArray && !isoFileNameMatchArray);

  const isIso =
    selectedDocumentType === DocumentType.isometric ||
    (isoFileNameMatchArray && !pidFileNameMatchArray);

  if (isPid) {
    return getPidDocumentMetaDataFromFileName(
      name,
      unit,
      pidFileNameMatchArray?.[0]
    );
  }
  if (isIso) {
    return getIsoDocumentMetaDataFromFileName(
      name,
      unit,
      isoFileNameMatchArray?.[0]
    );
  }

  return {
    type: DocumentType.unknown,
    name,
    unit,
  } as DocumentMetadata;
};

const useDiagramFile = (
  hasDocumentLoaded: boolean,
  diagramExternalId?: string
) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>({
    type: DocumentType.unknown,
    name: 'Unknown',
    unit: 'Unknown',
  });

  const { client } = useAuthContext();

  const setDocumentType = (documentType: DocumentType) => {
    if (file === null) return;
    const metaData = getMetadataFromFile(file, documentType);
    setDocumentMetadata(metaData);
  };

  const handleFileUpload = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (target && target.files?.length) {
      const file = target.files[0];
      setFile(file);
      return;
    }
    setFile(null);
  };

  const loadFileIfProvided = async () => {
    if (diagramExternalId && client) {
      setIsLoading(true);
      fetchFileByExternalId(client, diagramExternalId).then((file) => {
        setFile(file);
      });
    }
  };

  useEffect(() => {
    if (file) {
      const metadata = getMetadataFromFile(file);
      setDocumentMetadata(metadata);
    }
  }, [file]);

  useEffect(() => {
    setIsLoading(false);
  }, [hasDocumentLoaded]);

  return {
    file,
    handleFileUpload,
    loadFileIfProvided,
    isLoading,
    documentMetadata,
    setDocumentType,
  };
};

export default useDiagramFile;
