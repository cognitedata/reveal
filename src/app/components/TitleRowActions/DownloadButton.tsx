import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useCdfItem, baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

type Props = {
  id: number;
  type: ResourceType;
};

function MetadataDownload({ id, type }: Props) {
  const [downloading, setDownloading] = useState(false);
  const { data: metadata, isFetched } = useCdfItem(
    convertResourceType(type),
    { id },
    { enabled: downloading }
  );

  useEffect(() => {
    if (downloading && isFetched) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadata, null, 2)
      )}`;

      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', `${type}-${id}.json`);
      dlAnchorElem.click();
      setDownloading(false);
    }
  }, [downloading, id, type, metadata, isFetched]);

  useEffect(() => {
    setDownloading(false);
  }, [id, type]);

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          setDownloading(true);
        }}
      >
        Download metadata
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button
        type="ghost"
        disabled={downloading}
        icon={<Icon type={downloading ? 'Loading' : 'Download'} />}
      />
    </Dropdown>
  );
}

function TimeseriesDownloadButton({ id, type }: Props) {
  const sdk = useSDK();
  const [includeDatapoints, setIncludeDatpoints] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const api = convertResourceType(type);

  const { data: metadata = {}, isFetched: metadataFetched } = useCdfItem(
    api,
    { id },
    { enabled: downloading }
  );

  const limit = 100000;
  const { data: datapoints = [], isFetched: dataPointsFetched } = useQuery(
    [...baseCacheKey(api), 'datapoints', id, limit],
    () => sdk.datapoints.retrieve({ items: [{ id }], limit }),
    { enabled: downloading && includeDatapoints }
  );

  useEffect(() => {
    if (includeDatapoints) {
      if (downloading && metadataFetched && dataPointsFetched) {
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify({ ...metadata, datapoints }, null, 2)
        )}`;

        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', `${type}-${id}.json`);
        dlAnchorElem.click();
        setDownloading(false);
      }
    } else if (downloading && metadataFetched) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadata, null, 2)
      )}`;

      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', `${type}-${id}.json`);
      dlAnchorElem.click();
      setDownloading(false);
    }
  }, [
    downloading,
    id,
    type,
    metadata,
    metadataFetched,
    dataPointsFetched,
    datapoints,
    includeDatapoints,
  ]);

  useEffect(() => {
    setDownloading(false);
  }, [id, type]);

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          setIncludeDatpoints(false);
          setDownloading(true);
        }}
      >
        Download metadata
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setIncludeDatpoints(true);
          setDownloading(true);
        }}
      >
        Download metadata with datapoints
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button
        type="ghost"
        disabled={downloading}
        icon={<Icon type={downloading ? 'Loading' : 'Download'} />}
      />
    </Dropdown>
  );
}

export default function DownloadButton(props: Props) {
  switch (props.type) {
    case 'timeSeries':
      return <TimeseriesDownloadButton {...props} />;
    default:
      return <MetadataDownload {...props} />;
  }
}
