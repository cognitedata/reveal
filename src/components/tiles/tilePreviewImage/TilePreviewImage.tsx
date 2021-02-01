import React, { useContext, useEffect, useState } from 'react';
import { ImgPreview } from 'components/tiles/elements';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { Icon } from '@cognite/cogs.js';

type Props = {
  imageFileId: string;
};

const TilePreviewImage: React.FC<Props> = ({ imageFileId }) => {
  const client = useContext(CdfClientContext);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [loadDispatched, setLoadDispatched] = useState(false);

  useEffect(() => {
    const loadImageUrl = async () => {
      setLoading(true);
      try {
        const [{ downloadUrl }] = await client.getDownloadUrls([imageFileId]);
        setImgUrl(downloadUrl);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    if (imageFileId && !imgUrl && !loading && !loadDispatched) {
      loadImageUrl();
      setLoadDispatched(true);
    }
  }, [
    imageFileId,
    imgUrl,
    loading,
    loadDispatched,
    setLoading,
    setImgUrl,
    setLoadDispatched,
    client,
  ]);

  return (
    <ImgPreview>
      {loading ? (
        <Icon type="Loading" />
      ) : (
        <img src={imgUrl} alt="Board preview" />
      )}
    </ImgPreview>
  );
};

export default TilePreviewImage;
