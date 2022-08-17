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
import Highlighter from 'react-highlight-words';
import { Model3D } from '@cognite/sdk';
import { ResourceType } from '@cognite/data-exploration';
import { useCurrentResourceId } from 'app/hooks';

export type Model3DWithType = Model3D & {
  type: ResourceType;
};

type ThreeDGridPreviewProps = {
  item: Model3DWithType;
  query: string;
  name: string;
  modelId: number;
  style?: React.CSSProperties;
  onClick: (item: Model3DWithType) => void;
};
export const ThreeDGridPreview = ({
  item,
  query,
  name,
  modelId,
  style,
  onClick,
}: ThreeDGridPreviewProps) => {
  const { data: revision, isLoading } = useDefault3DModelRevision(modelId);
  const { data, isFetched } = use3DModelThumbnail(revision?.thumbnailURL);

  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const [activeId] = useCurrentResourceId();
  const isSelected = activeId === item.id;

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
    <div
      style={style}
      onClick={() => {
        onClick(item);
      }}
    >
      <GridItemWrapper isSelected={isSelected}>
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
    </div>
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

type GridItemType = {
  isSelected: boolean;
};
const GridItemWrapper = styled.div<GridItemType>`
  background-color: ${props => props.isSelected && 'var(--cogs-midblue-6)'};
  &:hover {
    background-color: ${props =>
      !props.isSelected && 'var(--cogs-greyscale-grey1)'};
    cursor: pointer;
  }
  padding: 15px;
  margin: 15px;
  border: 1px solid var(--cogs-greyscale-grey4);
  .highlighter-wrapper {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
