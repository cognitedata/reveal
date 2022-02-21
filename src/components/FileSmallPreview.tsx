import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  Loader,
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  ResourceIcons,
} from '@cognite/data-exploration';
import { createLink } from '@cognite/cdf-utilities';
import {
  isFilePreviewable,
  readablePreviewableFileTypes,
} from 'utils/mimeTypeUtils';
import { useAnnotationsDetails } from 'hooks';

export const FileSmallPreview = ({ fileId }: { fileId: number }) => {
  const {
    data: file,
    isFetched,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const { annotations } = useAnnotationsDetails(fileId);
  const canPreview = isFilePreviewable(file);

  if (!isFetched) {
    return <Loader />;
  }
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  if (!file) {
    return <>File {fileId} not found!</>;
  }
  if (!canPreview) {
    return (
      <CenteredPlaceholder>
        <h1>No preview for this type of file</h1>
        <p>
          File types that can be previewed are: {readablePreviewableFileTypes()}
        </p>
      </CenteredPlaceholder>
    );
  }

  return (
    <InfoGrid className="file-info-grid" noBorders>
      {file.name && (
        <InfoCell noBorders noPadding>
          <a
            href={createLink(`/explore/file/${fileId}`)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ResourceIcons.File />{' '}
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {file.name ?? file.externalId}
            </span>
          </a>
        </InfoCell>
      )}

      <InfoCell noBorders>
        <Preview>
          <CogniteFileViewer
            file={file}
            sdk={sdk}
            disableAutoFetch
            hideControls
            hideDownload
            hideSearch
            annotations={annotations[file.id]}
            pagination="small"
            overrideURLMap={{
              pdfjsWorkerSrc:
                '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
            }}
          />
        </Preview>
      </InfoCell>
    </InfoGrid>
  );
};

const Preview = styled.div`
  height: 300px;
`;

const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;
