import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, Space } from 'antd';
import { MenuItemProps } from 'antd/es/menu/MenuItem';
import { FileInfo } from '@cognite/sdk';
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

interface Foo extends MenuItemProps {
  fileId: number;
}
function FileDownloadMenuItem(props: Foo) {
  const sdk = useSDK();
  const { fileId: id } = props;
  const { data: fileInfo } = useCdfItem<FileInfo>('files', { id });
  const { data: fileLink, isFetched, isError } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', id],
    () => sdk.files.getDownloadUrls([{ id }]).then(r => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  if (!isFetched) {
    return (
      <Menu.Item disabled>
        <Space align="center" size="small">
          <Icon type="Loading" /> <em>Finding download link</em>
        </Space>
      </Menu.Item>
    );
  }

  if (isError || !fileLink?.downloadUrl) {
    return (
      <Menu.Item disabled>
        <Space align="center" size="small">
          <Icon type="ErrorStroked" />
          <em>Could not find download link</em>
        </Space>
      </Menu.Item>
    );
  }

  return (
    <Menu.Item {...props}>
      <a
        download={fileInfo?.name}
        target="_blank"
        rel="noopener noreferrer"
        href={fileLink!.downloadUrl}
      >
        Download original file
      </a>
    </Menu.Item>
  );
}

function FileDownloadButton({ id }: { id: number }) {
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
      <FileDownloadMenuItem fileId={id} />
      <Menu.Item disabled>Download including annotations</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button
        type="ghost"
        icon={<Icon type={downloading ? 'Loading' : 'Download'} />}
        disabled={downloading}
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
    case 'file':
      return <FileDownloadButton id={props.id} />;
    case 'timeSeries':
      return <TimeseriesDownloadButton {...props} />;
    default:
      return <MetadataDownload {...props} />;
  }
}
