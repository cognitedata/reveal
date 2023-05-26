import React, { useState, useEffect, useMemo } from 'react';
import Highlighter from 'react-highlight-words';

import styled from 'styled-components';

import { ThreeDModel } from '@data-exploration/components';
import { getObjectURL } from '@data-exploration-lib/core';
import {
  use3DModelThumbnailQuery,
  useDefault3DModelRevision,
} from '@data-exploration-lib/domain-layer';

import {
  Body,
  Icon,
  Loader,
  DocumentIcon,
  Title,
  Tooltip,
  Illustrations,
} from '@cognite/cogs.js';
import { ResourceType } from '@cognite/data-exploration';
import { Model3D } from '@cognite/sdk';

import { PartialBy } from './utils';

export type Model3DWithType = PartialBy<
  Model3D,
  'metadata' | 'dataSetId' | 'createdTime' | 'id'
> & {
  type: ResourceType | 'img360';
  siteId?: string;
};

type ThreeDGridPreviewProps = {
  item: Model3DWithType;
  query: string;
  name: string;
  modelId?: number;
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
  const { data, isFetched } = use3DModelThumbnailQuery(revision?.thumbnailURL);

  const [imageUrl, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (data) {
      const objectURL = getObjectURL(data);
      setImage(objectURL);
    }
    return () => {
      setImage((url) => {
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
      <GridItemWrapper isSelected={false}>
        <Thumbnail>
          {item?.type === 'img360' ? (
            <Illustrations.Solo type="ImagePicture" />
          ) : revision?.thumbnailURL ? (
            image
          ) : (
            <ThreeDModel color="white" />
          )}
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
  margin-bottom: 8px;

  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

type GridItemType = {
  isSelected: boolean;
};
const GridItemWrapper = styled.div<GridItemType>`
  background-color: ${(props) => props.isSelected && 'var(--cogs-midblue-6)'};
  &:hover {
    background-color: ${(props) =>
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
