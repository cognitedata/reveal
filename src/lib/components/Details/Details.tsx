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
    <div style={{ padding: '20px 10px' }}>
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
    </div>
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
  const tabValue = value || <em>Not set</em>;

  return (
    <div>
      <Name>{name}</Name>
      <Value copyable={!!value && copyable ? { tooltips: false } : false}>
        {link ? (
          <Link to={link} target="_blank">
            {tabValue}
            <Icon
              type="ArrowForward"
              style={{ marginLeft: '5px', verticalAlign: 'middle' }}
            />
          </Link>
        ) : (
          tabValue
        )}
      </Value>
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
