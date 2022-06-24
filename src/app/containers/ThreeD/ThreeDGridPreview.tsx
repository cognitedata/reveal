import React, { useState, useEffect, useMemo } from 'react';
import {
  useDefault3DModelRevision,
  use3DModelThumbnail,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import {
  Body,
  Icon,
  Loader,
  DocumentIcon,
  Title,
  Graphic,
  Tooltip,
} from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';
import { SEARCH_KEY } from 'app/utils/constants';
import Highlighter from 'react-highlight-words';

type ThreeDGridPreviewProps = {
  query: string;
  name: string;
  modelId: number;
  style?: React.CSSProperties;
};
export const ThreeDGridPreview = ({
  query,
  name,
  modelId,
  style,
}: ThreeDGridPreviewProps) => {
  const { data: revision, isLoading } = useDefault3DModelRevision(modelId);
  const { data, isFetched } = use3DModelThumbnail(revision?.thumbnailURL);

  const [imageUrl, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (data) {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView]);
      setImage(URL.createObjectURL(blob));
    }
    return () => {
      setImage(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [data]);

  const image = useMemo(() => {
    if (imageUrl) {
      return <img src={imageUrl} alt="thumbnail" />;
    }
    if (!isFetched) {
      return <Icon type="Loader" />;
    }

    return (
      <>
        <DocumentIcon
          file={String(revision?.id) || ''}
          style={{ height: 36, width: 36 }}
        />
        <Body level={3}>Unable to preview file.</Body>
      </>
    );
  }, [imageUrl, revision, isFetched]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Link
      to={createLink(`/explore/threeD/${modelId}`, { [SEARCH_KEY]: query })}
    >
      <GridItemContainer style={style}>
        <GridItemWrapper>
          <Thumbnail>
            {revision?.thumbnailURL && image}
            {!revision?.thumbnailURL && <Graphic type="ThreeDModel" />}
          </Thumbnail>
          <Tooltip content={name} arrow={false}>
            <Title level={6}>
              <Highlighter
                className="highlighter-wrapper"
                searchWords={query.split(' ')}
                autoEscape
                textToHighlight={name}
              />
            </Title>
          </Tooltip>
        </GridItemWrapper>
      </GridItemContainer>
    </Link>
  );
};

const Thumbnail = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
  }
`;

const GridItemContainer = styled.div`
  padding: 15px;
  cursor: pointer;
`;

const GridItemWrapper = styled.div`
  padding: 15px;
  border: 1px solid var(--cogs-greyscale-grey4);
  .highlighter-wrapper {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
