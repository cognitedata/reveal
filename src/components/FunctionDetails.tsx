import React from 'react';
import moment from 'moment';
import { Descriptions, Alert } from 'antd';
import LoadingIcon from 'components/LoadingIcon';
import { CogFunction } from 'types';
import { useQuery } from 'react-query';

type Props = {
  id: number;
  name: string;
};

export default function FunctionDetails({ id, name }: Props) {
  const { data: currentFunction, isFetched, error } = useQuery<CogFunction>(
    `/functions/${id}`
  );

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
      <Descriptions.Item label="Description" span={3}>
        {currentFunction?.description || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Created by" span={3}>
        {currentFunction?.owner || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Date Created" span={3}>
        {moment.utc(currentFunction?.createdTime).format('LLL')}
      </Descriptions.Item>
      <Descriptions.Item label="API Key" span={3}>
        {currentFunction?.apiKey || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Function Id" span={3}>
        {currentFunction?.id}
      </Descriptions.Item>
      <Descriptions.Item label="File Id" span={3}>
        {currentFunction?.fileId}
      </Descriptions.Item>
      <Descriptions.Item label="External Id" span={3}>
        {currentFunction?.externalId || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Secrets" span={3}>
        <div style={{ display: 'flex' }}>
          <pre>{JSON.stringify(currentFunction?.secrets, null, 4)}</pre>
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
}
