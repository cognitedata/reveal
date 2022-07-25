import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';
import { CognitePid, DocumentMetadata, DiagramType } from '@cognite/pid-tools';

import { fetchFileByExternalId } from './api';

const useDiagramFile = (
  pidViewer: React.MutableRefObject<CognitePid | undefined>,
  hasDocumentLoaded: boolean,
  diagramExternalId?: string
) => {
  const [file, setFile] = useState<File | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>({
    type: DiagramType.UNKNOWN,
    name: 'Unknown',
    unit: 'Unknown',
  });

  const { client } = useAuthContext();

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
      const [fileInfo, file] = await fetchFileByExternalId(
        client,
        diagramExternalId
      );

      setUnit(fileInfo.metadata?.unit ?? null);
      setFile(file);
    }
  };

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeMetadata(setDocumentMetadata);
    }
  });

  useEffect(() => {
    setIsLoading(false);
  }, [hasDocumentLoaded]);

  return {
    file,
    unit,
    handleFileUpload,
    loadFileIfProvided,
    isLoading,
    documentMetadata,
  };
};

export default useDiagramFile;
