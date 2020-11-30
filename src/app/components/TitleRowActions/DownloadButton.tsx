import React, { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { MenuItemProps } from 'antd/es/menu/MenuItem';
import { FileInfo } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { convertResourceType } from 'lib';
import FileDownloadAnchor from 'lib/components/FileDownloadAnchor';
import { useCdfItem, baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { ResourceItem } from 'lib/types';
import { trackUsage } from 'app/utils/Metrics';

type Props = {
  item: ResourceItem;
};

function MetadataDownload({ item: { id, type } }: Props) {
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

      trackUsage('Exploration.Action.Download.Metadata', { type, id });
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
        variant="outline"
        disabled={downloading}
        icon={downloading ? 'Loading' : 'Download'}
      />
    </Dropdown>
  );
}

function FileDownloadMenuItem({
  item: { id },
  ...props
}: Props & MenuItemProps) {
  return (
    <Menu.Item {...props}>
      <FileDownloadAnchor text={<>Download original file</>} id={{ id }} />
    </Menu.Item>
  );
}

function FileDownloadButton({ item }: Props) {
  const { id } = item;
  const [downloading, setDownloading] = useState(false);
  const { data: metadata, isFetched } = useCdfItem<FileInfo>(
    'files',
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
      dlAnchorElem.setAttribute('download', `file-${id}.json`);
      dlAnchorElem.click();

      trackUsage('Exploration.Action.Download.File', {
        id,
        mimeType: metadata?.mimeType,
      });
      setDownloading(false);
    }
  }, [downloading, id, metadata, isFetched]);

  useEffect(() => {
    setDownloading(false);
  }, [id]);

  // Having this as a function prevents continoysly fetching the download link in the brackground
  // when the menu isn't visible
  const menu = () => (
    <Menu>
      <Menu.Item
        onClick={() => {
          setDownloading(true);
        }}
      >
        Download metadata
      </Menu.Item>
      <FileDownloadMenuItem item={item} />
      <Menu.Item disabled>Download including annotations</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button
        variant="outline"
        icon={downloading ? 'Loading' : 'Download'}
        disabled={downloading}
      />
    </Dropdown>
  );
}

function TimeseriesDownloadButton({ item: { id, type } }: Props) {
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
    () =>
      sdk.datapoints
        .retrieve({ items: [{ id }], limit })
        .then(r => r[0].datapoints || []),
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

      trackUsage('Exploration.Action.Download.Timeseries', { id });
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
        variant="outline"
        disabled={downloading}
        icon={downloading ? 'Loading' : 'Download'}
      />
    </Dropdown>
  );
}

export default function DownloadButton({ item }: Props) {
  switch (item.type) {
    case 'file':
      return <FileDownloadButton item={item} />;
    case 'timeSeries':
      return <TimeseriesDownloadButton item={item} />;
    default:
      return <MetadataDownload item={item} />;
  }
}
