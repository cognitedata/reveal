import React from 'react';
import moment from 'moment';
import { Descriptions, Alert } from 'antd';
import LoadingIcon from 'components/LoadingIcon';
import { useFunction } from 'utils/hooks';

const { Item } = Descriptions;

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

  return (
    <Descriptions>
      <Item label="Description" span={3}>
        {currentFunction?.description || notSet}
      </Item>
      <Item label="CPU" span={3}>
        {currentFunction?.cpu || notSet}
      </Item>
      <Item label="Memory" span={3}>
        {currentFunction?.memory || notSet}
      </Item>

      <Item label="Created by" span={3}>
        {currentFunction?.owner || notSet}
      </Item>
      <Item label="Date Created" span={3}>
        {moment.utc(currentFunction?.createdTime).format('LLL')}
      </Item>
      <Item label="API Key" span={3}>
        {currentFunction?.apiKey || notSet}
      </Item>
      <Item label="Function Id" span={3}>
        {currentFunction?.id}
      </Item>
      <Item label="File Id" span={3}>
        {currentFunction?.fileId}
      </Item>
      <Item label="External Id" span={3}>
        {currentFunction?.externalId || notSet}
      </Item>
      <Item label="Secrets" span={3}>
        <div style={{ display: 'flex' }}>
          <pre>{JSON.stringify(currentFunction?.secrets, null, 4)}</pre>
        </div>
      </Item>
    </Descriptions>
  );
}
