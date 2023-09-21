import React, { useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
import {
  convertResourceType,
  ResourceItem,
  FileDownloadAnchor,
  Resource,
} from '@cognite/data-exploration';
import { DoubleDatapoint, FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';
import {
  MAX_DOWNLOAD_LIMIT_DATAPOINTS,
  useTimeseriesDataPointsQuery,
} from '@data-exploration-lib/domain-layer';

import { trackUsage } from '../../utils/Metrics';
import { DateFilter } from '../ResourceTitleRow';

type Props = {
  item: ResourceItem;
  dateFilter?: DateFilter;
};

const DOWNLOAD_DATA_LABEL = 'Download data as JSON';
const DOWNLOAD_DATAPOINTS_LABEL = 'Download data with datapoints as JSON';
const DOWNLOAD_DATAPOINTS_CSV_LABEL = 'Download datapoints as CSV';

function MetadataDownload({ item: { id, type } }: Props) {
  const { t } = useTranslation();

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
        {t('DOWNLOAD_DATA_LABEL', DOWNLOAD_DATA_LABEL)}
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip content={t('DOWNLOAD', 'Download')}>
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
  const { t } = useTranslation();
  return (
    <FileDownloadAnchor
      text={<>{t('DOWNLOAD_ORIGINAL_FILE', 'Download original file')}</>}
      id={{ id }}
    />
  );
}

function FileDownloadButton({ item }: Props) {
  const { t } = useTranslation();
  const { id } = item;
  const [downloading, setDownloading] = useState(false);
  const { data: metadata, isFetched } = useCdfItem<FileInfo>(
    'files',
    { id },
    { enabled: downloading }
  );

  // Handles downloading metadata as JSON
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
        {t('DOWNLOAD_DATA_LABEL', DOWNLOAD_DATA_LABEL)}
      </Menu.Item>
      <FileDownloadMenuItem item={item} />
    </Menu>
  );

  return (
    <Tooltip content={t('DOWNLOAD', 'Download')}>
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
  const { t } = useTranslation();
  const [includeDatapoints, setIncludeDatpoints] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadCSV, setDownloadCSV] = useState(false);

  const api = convertResourceType(type);

  const { data: metadata, isFetched: metadataFetched } = useCdfItem<Resource>(
    api,
    { id },
    { enabled: downloading }
  );

  const { data = [], isFetched: dataPointsFetched } =
    useTimeseriesDataPointsQuery(
      [{ id }],
      { ...dateFilter },
      { enabled: downloading && includeDatapoints },
      MAX_DOWNLOAD_LIMIT_DATAPOINTS
    );

  useEffect(() => {
    if (includeDatapoints) {
      if (
        downloading &&
        metadataFetched &&
        dataPointsFetched &&
        !isEmpty(data)
      ) {
        if (downloadCSV) {
          const { datapoints, externalId } = data[0];

          const csvContent =
            'data:text/csv;charset=utf-8,' +
            'timestamp,value\n' +
            (datapoints as DoubleDatapoint[])
              .map((point) => `${point.timestamp},${point.value}`)
              .join('\n');
          const dlAnchorElem = document.createElement('a');
          dlAnchorElem.setAttribute('href', csvContent);
          dlAnchorElem.setAttribute('download', `${type}-${externalId}.csv`);
          dlAnchorElem.click();

          setDownloading(false);
        } else {
          const { datapoints, externalId } = data[0];
          const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({ ...metadata, datapoints }, null, 2)
          )}`;

          const dlAnchorElem = document.createElement('a');
          dlAnchorElem.setAttribute('href', dataStr);
          dlAnchorElem.setAttribute('download', `${type}-${externalId}.json`);
          dlAnchorElem.click();

          setDownloading(false);
        }
      }

      trackUsage('Exploration.Action.Download.Timeseries', { id });
    } else if (downloading && metadataFetched && !isEmpty(metadata)) {
      const { externalId } = metadata;
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadata, null, 2)
      )}`;

      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', `${type}-${externalId}.json`);
      dlAnchorElem.click();

      setDownloading(false);
      trackUsage('Exploration.Action.Download.Timeseries', { id });
    }
  }, [
    downloading,
    id,
    type,
    metadata,
    metadataFetched,
    dataPointsFetched,
    data,
    includeDatapoints,
    downloadCSV,
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
        {t('DOWNLOAD_DATA_LABEL', DOWNLOAD_DATA_LABEL)}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setIncludeDatpoints(true);
          setDownloading(true);
        }}
      >
        {t('DOWNLOAD_DATAPOINTS_LABEL', DOWNLOAD_DATAPOINTS_LABEL)}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setIncludeDatpoints(true);
          setDownloading(true);
          setDownloadCSV(true);
        }}
      >
        {t('DOWNLOAD_DATAPOINTS_CSV_LABEL', DOWNLOAD_DATAPOINTS_CSV_LABEL)}
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip content={t('DOWNLOAD', 'Download')}>
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
