import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Loader } from '@data-exploration/components';

import { Flex } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import ReactUnifiedViewer, {
  isSupportedFileInfo,
} from '@cognite/unified-file-viewer';

import { ResourceItem } from '@data-exploration-lib/core';
import { useDocumentContainerQuery } from '@data-exploration-lib/domain-layer';

type DocumentPreviewProps = {
  id: string;
  applicationId: string;
  fileId: number;
  creatable: boolean;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  fileIcon?: React.ReactNode;
  showControls?: boolean;
  showDownload?: boolean;
  showSideBar?: boolean;
  enableZoomToAnnotation?: boolean;
  enableToolTips?: boolean;
  filesAcl?: boolean;
  annotationsAcl?: boolean;
  setEditMode?: () => void;
  isDocumentsApiEnabled?: boolean;
};

export const DocumentPreview = ({
  id,
  applicationId,
  fileId,
  showControls = true,
}: // isDocumentsApiEnabled = true,
DocumentPreviewProps) => {
  const { data: file, isFetched: isFileFetched } = useCdfItem<FileInfo>(
    'files',
    {
      id: fileId,
    }
  );

  const { data: containerData } = useDocumentContainerQuery(file);

  const container = useMemo(() => {
    if (file && isSupportedFileInfo(file)) {
      return containerData;
    }
    return undefined;
  }, [file, containerData]);

  if (file !== undefined && !isSupportedFileInfo(file)) {
    return (
      <CenteredPlaceholder>
        <h1>No preview for this file type</h1>
      </CenteredPlaceholder>
    );
  }

  if (!isFileFetched || container === undefined || file === undefined) {
    return <Loader />;
  }

  return (
    <FullHeightWrapper justifyContent="flex-end">
      <UFVWrapper>
        <ReactUnifiedViewer
          applicationId={applicationId}
          id={id}
          containers={[container]}
          shouldShowZoomControls={showControls}
        />
      </UFVWrapper>
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled(Flex)`
  height: 500px;
`;

const UFVWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;

const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;
