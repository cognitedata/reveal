import React, { useEffect, useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
import {
  convertResourceType,
  ResourceItem,
  FileDownloadAnchor,
  Resource,
} from '@cognite/data-exploration';

import { useCdfItem, baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { trackUsage } from 'app/utils/Metrics';
import { DateFilter } from 'app/components/ResourceTitleRow';

type Props = {
  item: ResourceItem;
  dateFilter?: DateFilter;
};

const DOWNLOAD_DATA_LABEL = 'Download data as JSON';

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
        {DOWNLOAD_DATA_LABEL}
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip content="Download">
      <Dropdown content={menu} openOnHover={false}>
        <Button
          disabled={downloading}
          icon={downloading ? 'Loader' : 'Download'}
          aria-label="Download"
        />
      </Dropdown>
    </Tooltip>
  );
}

function FileDownloadMenuItem({ item: { id } }: Props) {
  return (
    <Menu.Item>
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

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          setDownloading(true);
        }}
      >
        {DOWNLOAD_DATA_LABEL}
      </Menu.Item>
      <FileDownloadMenuItem item={item} />
    </Menu>
  );

  return (
    <Tooltip content="Download">
      <Dropdown content={menu} openOnHover={false}>
        <Button
          icon={downloading ? 'Loader' : 'Download'}
          title="Download"
          disabled={downloading}
          aria-label="Download"
        />
      </Dropdown>
    </Tooltip>
  );
}

function TimeseriesDownloadButton({ item: { id, type }, dateFilter }: Props) {
  const sdk = useSDK();
  const [includeDatapoints, setIncludeDatpoints] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const api = convertResourceType(type);

  const { data: metadata = {}, isFetched: metadataFetched } =
    useCdfItem<Resource>(api, { id }, { enabled: downloading });

  const limit = 100000;
  const { data: datapoints = [], isFetched: dataPointsFetched } = useQuery(
    [...baseCacheKey(api), 'datapoints', id, limit, dateFilter],
    () =>
      sdk.datapoints
        .retrieve({ items: [{ id }], limit, ...dateFilter })
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
        {DOWNLOAD_DATA_LABEL}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setIncludeDatpoints(true);
          setDownloading(true);
        }}
      >
        Download data with datapoints as JSON
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip content="Download">
      <Dropdown content={menu} openOnHover={false}>
        <Button
          disabled={downloading}
          icon={downloading ? 'Loader' : 'Download'}
          aria-label="Download"
        />
      </Dropdown>
    </Tooltip>
  );
}

export default function DownloadButton({ item, dateFilter }: Props) {
  switch (item.type) {
    case 'file':
      return <FileDownloadButton item={item} />;
    case 'timeSeries':
      return <TimeseriesDownloadButton item={item} dateFilter={dateFilter} />;
    default:
      return <MetadataDownload item={item} />;
  }
}
