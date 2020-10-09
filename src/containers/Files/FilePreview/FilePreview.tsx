/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  convertCogniteAnnotationToIAnnotation,
} from '@cognite/react-picture-annotation';
import { Splitter, Loader } from 'components/Common';
import styled from 'styled-components';
import { isFilePreviewable } from 'utils/FileUtils';
import { AnnotationPreviewSidebar } from 'containers/Files/FilePreview/AnnotationPreviewSidebar';
import { v4 as uuid } from 'uuid';
import { PendingCogniteAnnotation } from '@cognite/annotations';
import { FileOverviewPanel } from 'containers/Files/FilePreview/FileOverviewPanel';
import { ContextualizationModule } from 'containers/Files/FilePreview/ContextualizationModule';
import { useCdfItem } from 'hooks/sdk';
import { SdkContext } from 'context/sdk';
import { useAnnotations } from '../hooks';

type Props = {
  fileId: number;
  contextualization?: boolean;
};

const FilePreview = ({ fileId, contextualization = false }: Props) => {
  const [creatable, setCreatable] = useState(false);

  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  useEffect(() => {
    setPendingAnnotations([]);
  }, [fileId]);

  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>(
    'files',
    fileId!,
    {
      enabled: !!fileId,
    }
  );

  const annotations = useAnnotations(fileId);
  const allAnnotations = [...annotations, ...pendingAnnotations];

  const canPreviewFile = file && isFilePreviewable(file);

  if (!fileFetched) {
    return <Loader />;
  }

  if (!canPreviewFile) {
    return (
      <CenteredPlaceholder>
        <h1>No Preview For File</h1>
        <p>Please search for a File to start viewing.</p>
      </CenteredPlaceholder>
    );
  }

  return (
    <>
      <Splitter primaryIndex={1}>
        <FileOverviewPanel
          fileId={fileId}
          pendingAnnotations={pendingAnnotations}
          setPendingAnnotations={setPendingAnnotations}
          creatable={creatable}
          setCreatable={setCreatable}
          contextualization={contextualization}
        />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <CogniteFileViewer.FileViewer
            file={file}
            creatable={creatable}
            annotations={allAnnotations}
            hideDownload
            hideSearch
            renderAnnotation={(annotation, isSelected) => {
              const iAnnotation = convertCogniteAnnotationToIAnnotation(
                annotation,
                isSelected
              );
              if (annotation.metadata && annotation.metadata.color) {
                iAnnotation.mark.strokeColor = annotation.metadata.color;
              }
              return iAnnotation;
            }}
            editCallbacks={{
              onCreate: (item: PendingCogniteAnnotation) => {
                const newItem = { ...item, id: uuid() };
                setPendingAnnotations([newItem]);
                return false;
              },
              onUpdate: () => {
                return false;
              },
            }}
          />
        </div>
      </Splitter>
      <AnnotationPreviewSidebar
        fileId={fileId}
        pendingAnnotations={pendingAnnotations}
        setPendingAnnotations={setPendingAnnotations}
        contextualization={contextualization}
      />
      {contextualization && (
        <ContextualizationModule
          fileId={fileId}
          pendingAnnotations={pendingAnnotations}
          setPendingAnnotations={setPendingAnnotations}
        />
      )}
    </>
  );
};
const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;

const WrappedFilePreview = (props: Props) => {
  const sdk = useContext(SdkContext)!;
  return (
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
      <FilePreview {...props} />
    </CogniteFileViewer.Provider>
  );
};

export { WrappedFilePreview as FilePreview };
