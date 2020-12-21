import React from 'react';
import Typography from 'antd/lib/typography';
import styled from 'styled-components';
import { Body, Colors, Icon } from '@cognite/cogs.js';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { convertResourceType, ResourceType } from 'lib/types';
import { DataSet } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';

const { Text } = Typography;

export const DetailsTabGrid = ({
  children,
}: {
  children: React.ReactNode[];
}) => {
  return (
    <GridContainer>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 5,
        }}
        dataSource={children}
        renderItem={item => <List.Item>{item}</List.Item>}
      />
    </GridContainer>
  );
};

export const DetailsTabItem = ({
  name,
  value,
  copyable = false,
  link,
}: {
  name: string;
  value?: any;
  copyable?: boolean;
  link?: string;
}) => {
  return (
    <div>
      <Name>{name}</Name>
      {value ? (
        <Value
          copyable={
            !!value && copyable
              ? { icon: <Icon type="Copy" />, tooltips: false }
              : false
          }
        >
          {link ? <Link to={link}>{value}</Link> : value}
        </Value>
      ) : (
        <em>Not set</em>
      )}
    </div>
  );
};

export const DataSetItem = ({
  id,
  type,
}: {
  id: number;
  type: ResourceType;
}) => {
  const { data: item, isFetched } = useCdfItem<{ dataSetId?: number }>(
    convertResourceType(type),
    { id }
  );
  const { data: ds } = useCdfItem<DataSet>(
    'datasets',
    { id: item?.dataSetId! },
    {
      enabled: isFetched && Number.isFinite(item?.dataSetId),
    }
  );

  if (isFetched && item) {
    return (
      <DetailsTabItem
        name="Data set"
        value={ds?.name || item?.dataSetId}
        link={
          item.dataSetId
            ? createLink(`/data-sets/data-set/${item.dataSetId}`)
            : undefined
        }
      />
    );
  }

  return null;
};

export const AssetsItem = ({
  assetIds,
  linkId,
  type,
}: {
  assetIds: number[] | undefined;
  linkId: number;
  type: ResourceType;
}) => {
  if (assetIds) {
    if (assetIds.length === 1) {
      return <AssetItem id={assetIds[0]} />;
    }
    const assetsLink = createLink(
      window.location.pathname.includes('/search')
        ? `/explore/search/${type}/${linkId}/asset`
        : `/explore/${type}/${linkId}/asset`
    );
    const assetsLinkText = `${assetIds.length} assets`;
    return (
      <DetailsTabItem
        name="Linked asset(s)"
        value={assetsLinkText}
        link={assetsLink}
      />
    );
  }
  return <DetailsTabItem name="Linked asset(s)" />;
};

export const AssetItem = ({ id }: { id: number }) => {
  const { data: item, isFetched } = useCdfItem<{ name?: string }>('assets', {
    id,
  });

  if (isFetched && item) {
    return (
      <DetailsTabItem
        name="Linked asset(s)"
        value={item.name}
        link={createLink(`/explore/asset/${id}`)}
      />
    );
  }

  return null;
};

const GridContainer = styled.div`
  padding: 20px 16px;
`;

const Name = styled(Body)`
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Value = styled(Text)`
  font-size: 16px;
`;

export const Label = styled.span`
  background-color: ${Colors['greyscale-grey3'].hex()};
  padding: 5px;
  margin-right: 5px;
  border-radius: 4px;
`;
