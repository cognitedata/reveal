import React from 'react';
import { ImgPreview } from 'components/tiles/elements';
import { Icon } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { getImgUrlsState } from 'store/suites/selectors';
import { ExternalId } from '@cognite/sdk';

type Props = {
  imageFileId: string;
};

const TilePreviewImage: React.FC<Props> = ({ imageFileId }) => {
  const { loading, urls } = useSelector(getImgUrlsState);
  const { downloadUrl } =
    urls.find((url) => imageFileId === (url as ExternalId).externalId) || {};

  return (
    <ImgPreview>
      {loading ? (
        <Icon type="Loading" />
      ) : (
        <img src={downloadUrl} alt="Board preview" />
      )}
    </ImgPreview>
  );
};

export default TilePreviewImage;
