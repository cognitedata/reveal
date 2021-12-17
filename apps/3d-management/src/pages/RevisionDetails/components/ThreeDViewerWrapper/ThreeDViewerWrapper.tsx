import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import zIndex from 'src/utils/zIndex';
import { Revision3DStatus, Revision3D } from '@cognite/sdk';
import { LazyWrapper } from 'src/components/LazyWrapper';
import Thumbnail from 'src/components/Thumbnail';

import { isModelFormatDeprecated } from 'src/pages/RevisionDetails/components/ThreeDViewerWrapper/isModelFormatDeprecated';
import { DeprecatedModelMessage } from 'src/pages/RevisionDetails/components/ThreeDViewerWrapper/DeprecatedModelMessage';
import { CloseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import { ThreeDViewerProps } from '../ThreeDViewer/ThreeDViewer.d';

const ERROR_TEXT: Record<Revision3DStatus, string> = {
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

const CenteredIcon = styled(AntdIcon)`
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

function AntdIcon({ name, ...rest }: any) {
  switch (name) {
    case 'play': {
      return <PlayCircleFilled {...rest} />;
    }
    case 'close': {
      return <CloseCircleFilled {...rest} />;
    }
    default: {
      throw new Error(`unknown icon name ${name}`);
    }
  }
}

const MultiLayeredContainer = styled.div<{ errorState?: boolean }>`
  position: relative;
  display: inline-block;
  margin: auto;
  min-height: 200px;
  min-width: 200px;
  background-color: #b8b8b8;
  width: ${(props) => (props.errorState ? '200px' : 'inherit')};
`;

type Props = {
  modelId: number;
  revision: Revision3D;
  canBeViewed: boolean;
  useOldViewer: boolean;
};

const ThreeDViewer = (props: ThreeDViewerProps) =>
  LazyWrapper(props, () => import('../ThreeDViewer'));

const MemoizedThreeDViewer = React.memo(
  (props: ThreeDViewerProps) => <ThreeDViewer {...props} />,
  // eslint-disable-next-line prefer-arrow-callback
  function areEqual(prevProps, nextProps) {
    if (
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
  const [isDeprecated, setIsDeprecated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [module, isDeprecatedFormat] = await Promise.all([
        getViewerModule(props.useOldViewer),
        isModelFormatDeprecated(props.modelId, props.revision.id),
      ]);

      if (isMounted) {
        setViewerConstructor(() => module.Cognite3DViewer);
        setIsDeprecated(isDeprecatedFormat);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [props.useOldViewer, props.modelId, props.revision.id]);

  if (isViewerOpened && ViewerConstructor) {
    if (isDeprecated) {
      return <DeprecatedModelMessage />;
    }
    return (
      <MemoizedThreeDViewer
        modelId={props.modelId}
        revision={props.revision}
        ViewerConstructor={ViewerConstructor}
      />
    );
  }

  if (!props.canBeViewed) {
    return (
      <div style={{ textAlign: 'center', bottom: '0px', flex: 1 }}>
        <ErrorText>{ERROR_TEXT[props.revision.status]}</ErrorText>
        <MultiLayeredContainer errorState>
          <CenteredIcon name="close" style={{ cursor: 'not-allowed' }} />
        </MultiLayeredContainer>
      </div>
    );
  }

  return (
    <MultiLayeredContainer
      style={{ cursor: 'pointer' }}
      onClick={() => setIsViewerOpened(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsViewerOpened(true);
        }
      }}
      aria-label="Open 3d-viewer"
      tabIndex={0}
    >
      <div style={{ display: 'flex' }}>
        <Thumbnail
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

      <CenteredIcon name="play" />
    </MultiLayeredContainer>
  );
}
