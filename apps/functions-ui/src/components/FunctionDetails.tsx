import React from 'react';

import styled from 'styled-components';

import LoadingIcon from '@functions-ui/components/LoadingIcon';
import { useFunction } from '@functions-ui/utils/hooks';
import { Descriptions, Alert, Typography } from 'antd';
import moment from 'moment';

const { Item } = Descriptions;
const { Text } = Typography;

type Props = {
  id: number;
  name: string;
};

export default function FunctionDetails({ id, name }: Props) {
  const { data: currentFunction, isFetched, error } = useFunction(id);

  if (error) {
    return (
      <Alert
        type="error"
        message={`Something went wrong when getting the function details for ${name}(${id})`}
      />
    );
  }
  if (!isFetched) {
    return <LoadingIcon />;
  }

  const notSet = <em>Not Set</em>;

  const StyledDescriptions = styled(Descriptions)`
    td.ant-descriptions-item {
      display: flex;
      flex-wrap: wrap;
    }
  `;

  return (
    <StyledDescriptions>
      <Item label="Description" span={3}>
        {currentFunction?.description || notSet}
      </Item>
      <Item label="CPU" span={3}>
        {currentFunction?.cpu ? `${currentFunction?.cpu} Cores` : notSet}
      </Item>
      <Item label="Memory" span={3}>
        {currentFunction?.memory ? `${currentFunction?.memory} GB` : notSet}
      </Item>
      <Item label="Runtime" span={3}>
        {currentFunction?.runtime || notSet}
      </Item>
      {currentFunction?.runtimeVersion && (
        <Item label="Runtime Version" span={3}>
          {currentFunction?.runtimeVersion}
        </Item>
      )}
      <Item label="Created by" span={3}>
        {currentFunction?.owner || notSet}
      </Item>
      <Item label="Date Created" span={3}>
        {moment.utc(currentFunction?.createdTime).format('LLL')}
      </Item>
      <Item label="Function Id" span={3}>
        <Text copyable>{currentFunction?.id}</Text>
      </Item>
      <Item label="File Id" span={3}>
        <Text copyable>{currentFunction?.fileId}</Text>
      </Item>
      <Item label="External Id" span={3}>
        {currentFunction?.externalId ? (
          <Text copyable>{currentFunction?.externalId}</Text>
        ) : (
          notSet
        )}
      </Item>
      <Item label="Secrets" span={3}>
        <div style={{ display: 'flex' }}>
          <pre>{JSON.stringify(currentFunction?.secrets, null, 4)}</pre>
        </div>
      </Item>
      <Item label="Metadata" span={3}>
        <div style={{ display: 'flex' }}>
          <pre>{JSON.stringify(currentFunction?.metadata || {}, null, 4)}</pre>
        </div>
      </Item>
    </StyledDescriptions>
  );
}