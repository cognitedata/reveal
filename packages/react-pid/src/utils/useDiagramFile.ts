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
  const [isLoading, setIsLoading] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>({
    type: DiagramType.unknown,
    name: 'Unknown',
    unit: 'Unknown',
  });

  const { client } = useAuthContext();

  const setDiagramType = (diagramType: DiagramType) => {
    if (pidViewer.current === undefined) return;
    pidViewer.current.setDocumentMetadata(diagramType);
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
    if (pidViewer.current) {
      pidViewer.current.onChangeMetadata(setDocumentMetadata);
    }
  });

  useEffect(() => {
    setIsLoading(false);
  }, [hasDocumentLoaded]);

  return {
    file,
    handleFileUpload,
    loadFileIfProvided,
    isLoading,
    documentMetadata,
    setDiagramType,
  };
};

export default useDiagramFile;
