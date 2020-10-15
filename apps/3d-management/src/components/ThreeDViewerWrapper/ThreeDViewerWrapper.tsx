import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Icon from 'antd/lib/icon';
import zIndex from 'utils/zIndex';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { LazyWrapper } from 'components/LazyWrapper';
import Thumbnail from '../Thumbnail/index';
import { ThreeDViewerProps } from '../ThreeDViewer/ThreeDViewer.d';

const ThumbnailJS: any = Thumbnail;

const ERROR_TEXT: Record<v3.Revision3DStatus, string> = {
  Queued: 'Model is waiting to be processed...',
  Processing: 'Model is still being processed...',
  Failed: 'Unable to load model due to processing errors.',
  Done: '',
};

const ErrorText = styled.p`
  width: 240px;
  padding: 12px;
  margin: 0 auto;
`;

const CenteredIcon = styled(Icon)`
  position: absolute;
  color: rgba(255, 255, 255, 0.75);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${zIndex.THREED_VIEWER_OVERLAY_BUTTON};
  font-size: 16em;
  overflow: hidden;
  cursor: pointer;
  && svg {
    height: 100%;
    width: 100%;
  }
`;

const MultiLayeredContainer = styled.div<{ errorState?: boolean }>`
  position: relative;
  display: inline-block;
  margin: auto;
  min-height: 200px;
  min-width: 200px;
  width: ${(props) => (props.errorState ? '200px' : 'inherit')};
`;

type Props = {
  modelId: string;
  revision: v3.Revision3D;
  useOldViewer?: boolean;
  revisionLogs: { type: string }[];
};

const ThreeDViewer = (props: ThreeDViewerProps) =>
  LazyWrapper(props, () => import('../ThreeDViewer'));

const MemoizedThreeDViewer = React.memo(
  (props: ThreeDViewerProps) => <ThreeDViewer {...props} />,
  function areEqual(prevProps, nextProps) {
    if (
      prevProps.ViewerConstructor === nextProps.ViewerConstructor &&
      prevProps.modelId === nextProps.modelId &&
      prevProps.revision.id === nextProps.revision.id
    ) {
      return true;
    }
    return false;
  }
);

function getViewerModule(
  useOld?: boolean
): Promise<
  typeof import('@cognite/3d-viewer') | typeof import('@cognite/reveal')
> {
  if (useOld) {
    return import('@cognite/3d-viewer');
  }
  return import('@cognite/reveal');
}

export default function ThreeDViewerWrapper(props: Props) {
  const [isViewerOpened, setIsViewerOpened] = useState<boolean>(false);
  const [ViewerConstructor, setViewerConstructor] = useState<
    | typeof import('@cognite/3d-viewer').Cognite3DViewer
    | typeof import('@cognite/reveal').Cognite3DViewer
  >();

  useEffect(() => {
    (async () => {
      const module = await getViewerModule(props.useOldViewer);
      setViewerConstructor(() => module.Cognite3DViewer);
    })();
  }, [props.useOldViewer]);

  if (isViewerOpened && ViewerConstructor) {
    return (
      <MemoizedThreeDViewer
        modelId={props.modelId}
        revision={props.revision}
        ViewerConstructor={ViewerConstructor}
      />
    );
  }
  if (!props.revisionLogs) return null;

  const canBeViewed =
    props.revision.status === 'Done' ||
    props.revisionLogs.find(
      (log) => log.type === 'reveal-optimizer/Success'
    ) !== undefined;

  if (!canBeViewed) {
    return (
      <div style={{ textAlign: 'center', bottom: '0px', flex: 1 }}>
        <ErrorText>{ERROR_TEXT[props.revision.status]}</ErrorText>
        <MultiLayeredContainer
          errorState
          style={{ backgroundColor: '#b8b8b8' }}
        >
          <CenteredIcon
            type="close-circle"
            theme="filled"
            style={{ cursor: 'not-allowed' }}
          />
        </MultiLayeredContainer>
      </div>
    );
  }

  return (
    <MultiLayeredContainer
      style={{ cursor: 'pointer', backgroundColor: '#b8b8b8' }}
      onClick={() => setIsViewerOpened(true)}
    >
      <div style={{ display: 'flex' }}>
        <ThumbnailJS
          {...(props.revision.thumbnailThreedFileId
            ? { fileId: Number(props.revision.thumbnailThreedFileId) }
            : { modelId: Number(props.modelId) })}
          width="600px"
          style={{
            position: 'relative',
            zIndex: zIndex.DEFAULT,
          }}
        />
      </div>

      <CenteredIcon type="play-circle" theme="filled" />
    </MultiLayeredContainer>
  );
}
