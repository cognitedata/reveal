import React, { ImgHTMLAttributes } from 'react';
import Spinner from 'src/components/Spinner';
import { Tooltip, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useRevisions } from 'src/hooks/revisions';
import { useThumbnailFileQuery } from 'src/components/Thumbnail/useThumbnailFile';

const ThumbnailHint = styled.div`
  display: flex;
  align-items: center;
  line-height: 16px;
`;

type WithFileId = {
  fileId: number;
  modelId?: never;
};

type WithModelId = {
  fileId?: never;
  modelId: number;
};

type CommonProps = ImgHTMLAttributes<HTMLImageElement>;

const ThumbnailSpinner = styled(Spinner)`
  margin-top: 0;
`;

function ThumbnailWithFileId(props: { fileId: number } & CommonProps) {
  const { fileId, style, ...restProps } = props;
  const { data: imgSrc, isLoading } = useThumbnailFileQuery(fileId);

  if (isLoading) {
    return <ThumbnailSpinner />;
  }

  return (
    <img
      alt="Model thumbnail"
      src={imgSrc}
      style={{ textAlign: 'center', ...style }}
      {...restProps}
    />
  );
}

function ThumbnailWithModelId(props: { modelId: number } & CommonProps) {
  const { modelId, ...restProps } = props;
  const revisionsQuery = useRevisions(modelId);

  if (revisionsQuery.isLoading) {
    return <ThumbnailSpinner />;
  }

  const revWithThumbnail = (revisionsQuery.data || []).find(
    (rev) => rev.thumbnailThreedFileId
  );
  const fileId = revWithThumbnail?.thumbnailThreedFileId;

  if (!fileId) {
    return (
      <ThumbnailHint>
        <span>This model has no thumbnail</span>
        <Tooltip content="To create a thumbnail, open one of the revisions, and press the camera button.">
          <Icon type="Help" style={{ marginLeft: '4px' }} />
        </Tooltip>
      </ThumbnailHint>
    );
  }

  return <ThumbnailWithFileId fileId={fileId} {...restProps} />;
}

type Props = (WithFileId | WithModelId) & CommonProps;

export default React.memo(
  // eslint-disable-next-line prefer-arrow-callback
  function Thumbnail(props: Props) {
    const { fileId, modelId, ...restProps } = props;
    if (fileId) {
      return <ThumbnailWithFileId fileId={fileId} {...restProps} />;
    }
    return <ThumbnailWithModelId modelId={modelId!} {...restProps} />;
  },
  (prev, next) =>
    prev.fileId === next.fileId ||
    (!!prev.modelId && prev.modelId === next.modelId)
);
