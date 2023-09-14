import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';
import ReactUnifiedViewer, {
  isSupportedFileInfo,
} from '@cognite/unified-file-viewer';

import { Spinner } from '../../../../components/loader/Spinner';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFileContainerQuery } from '../../../../services/files/queries/useFileContainerQuery';
import { useFileByIdQuery } from '../../../../services/instances/file/queries/useFileByIdQuery';

export type FilePreviewProps = {
  id: string;
  applicationId: string;
  fileId: number | string;
  creatable: boolean;
  contextualization: boolean;
  fileIcon?: React.ReactNode;
  showControls?: boolean;
  showDownload?: boolean;
  showSideBar?: boolean;
  enableZoomToAnnotation?: boolean;
  enableToolTips?: boolean;
  filesAcl?: boolean;
  annotationsAcl?: boolean;
  setEditMode?: () => void;
};

export const FilePreview = ({
  id,
  applicationId,
  fileId,
  showControls = true,
}: FilePreviewProps) => {
  const { t } = useTranslation();
  const { data: file, isFetched: isFileFetched } = useFileByIdQuery(fileId);

  const { data: containerData } = useFileContainerQuery(file);

  const container = useMemo(() => {
    if (file && isSupportedFileInfo(file)) {
      return containerData;
    }
  }, [file, containerData]);

  if (file !== undefined && !isSupportedFileInfo(file)) {
    return (
      <CenteredPlaceholder>
        <h1>{t('FILE_PREVIEW_UNSUPPORTED_FILE_TYPE')}</h1>
      </CenteredPlaceholder>
    );
  }

  if (!isFileFetched || container === undefined || file === undefined) {
    return (
      <CenteredPlaceholder>
        <Spinner />
      </CenteredPlaceholder>
    );
  }

  return (
    <FullHeightWrapper justifyContent="flex-end">
      <UFVWrapper>
        <ReactUnifiedViewer
          shouldUseAdaptiveRendering
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
  height: 100%;
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
