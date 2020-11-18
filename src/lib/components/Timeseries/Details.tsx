import React from 'react';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { DetailsItem } from 'lib/components';
import { formatMetadata } from 'lib/utils';

const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: number | string;
}) => (
  <div key={label}>
    <h4>{label}</h4>
    <p>{value || <em>Not set</em>}</p>
  </div>
);

export default function Details({ id }: { id: number }) {
  const transformItem = (ts: any): Timeseries => {
    return {
      ...ts,
      lastUpdatedTime: ts.lastUpdatedTime
        ? new Date(ts.lastUpdatedTime)
        : undefined,
      createdTime: ts.createdTime ? new Date(ts.createdTime) : undefined,
    } as Timeseries;
  };
  const { data, isFetched } = useCdfItem<any>('timeseries', { id });
  const ts = isFetched ? transformItem(data) : undefined;

  return (
    <>
      {isFetched && (
        <>
          <h2>Details</h2>
          <Row>
            <Col span={12}>
              <Detail label="Description" value={ts?.description} />
            </Col>
            <Col span={12}>
              <Detail label="Unit" value={ts?.unit} />
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Detail label="External ID" value={ts?.externalId} />
            </Col>
            <Col span={12}>
              <Detail label="ID" value={ts?.id} />
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Detail
                label="Created"
                value={ts?.createdTime?.toLocaleDateString()}
              />
            </Col>
            <Col span={12}>
              <Detail
                label="Last updated"
                value={ts?.lastUpdatedTime?.toLocaleDateString()}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Detail label="Data set" value={ts?.dataSetId} />
            </Col>
          </Row>
        </>
      )}
      {ts?.metadata && (
        <>
          <h2>Metadata</h2>
          {formatMetadata(ts?.metadata).map(el => (
            <DetailsItem key={el.key} name={el.key} value={el.value} />
          ))}
        </>
      )}
    </>
  );
}
