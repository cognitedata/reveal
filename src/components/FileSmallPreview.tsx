import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import {
  Loader,
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  ResourceIcons,
  useAnnotations,
} from '@cognite/data-exploration';
import { convertEventsToAnnotations } from '@cognite/annotations';
import { createLink } from '@cognite/cdf-utilities';

export const FileSmallPreview = ({ fileId }: { fileId: number }) => {
  const sdk = useSDK();

  const { data: file, isFetched, error } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const { data: eventAnnotations } = useAnnotations(fileId);
  const annotations = convertEventsToAnnotations(eventAnnotations);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }
  if (!file) {
    return <>File {fileId} not found!</>;
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
            annotations={annotations}
            pagination="small"
          />
        </Preview>
      </InfoCell>
    </InfoGrid>
  );
};

const Preview = styled.div`
  height: 300px;
`;
