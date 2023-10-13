import React, { useEffect, useState, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Dropdown, Menu, Tooltip } from 'antd';

import { Button } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from '@cognite/data-exploration';
import { InternalId, Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey, useCdfItems } from '@cognite/sdk-react-query-hooks';

type Props = {
  ids: InternalId[];
  resourceType: ResourceType;
};

function MetadataDownload({ ids, resourceType }: Props) {
  const [downloading, setDownloading] = useState(false);
  const { data: metadata = [], isFetched } = useCdfItems(
    convertResourceType(resourceType),
    ids,
    false,
    { enabled: downloading }
  );
  useEffect(() => {
    if (downloading && isFetched) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadata, null, 2)
      )}`;

      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', `${resourceType}.json`);
      dlAnchorElem.click();
      setDownloading(false);
    }
  }, [downloading, isFetched, metadata, resourceType]);

  useEffect(() => {
    setDownloading(false);
  }, [ids, resourceType]);

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
      <Tooltip title="Download">
        <Button
          disabled={downloading}
          icon={downloading ? 'Loader' : 'Download'}
        />
      </Tooltip>
    </Dropdown>
  );
}

function TimeseriesDownloadButton({ ids }: Pick<Props, 'ids'>) {
  const sdk = useSDK();
  const [includeDatapoints, setIncludeDatpoints] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const limit = 100000;
  const { data: metadata = [], isFetched: metadataFetched } =
    useCdfItems<Timeseries>('timeseries', ids, false, {
      enabled: downloading,
    });
  const { data: datapoints = [], isFetched: dataPointsFetched } = useQuery(
    [...baseCacheKey('timeseries'), 'datapoints', ids, limit],
    () =>
      Promise.all(
        ids.map(({ id }) =>
          sdk.datapoints
            .retrieve({ items: [{ id }], limit })
            .then((r) => r[0].datapoints)
        )
      ),
    { enabled: downloading && includeDatapoints }
  );

  const metadataIncDatapoints = useMemo(
    () =>
      metadataFetched && dataPointsFetched
        ? metadata.map((d, i) => ({
            ...d,
            datapoints: datapoints[i] || [],
          }))
        : [],
    [metadata, metadataFetched, datapoints, dataPointsFetched]
  );

  useEffect(() => {
    if (includeDatapoints) {
      if (downloading && dataPointsFetched) {
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(metadataIncDatapoints, null, 2)
        )}`;

        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', `timeseries-inc-datapoints.json`);
        dlAnchorElem.click();
        setDownloading(false);
      }
    } else if (downloading && metadataFetched) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadata, null, 2)
      )}`;

      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', `timeseries.json`);
      dlAnchorElem.click();
      setDownloading(false);
    }
  }, [
    downloading,
    metadata,
    metadataIncDatapoints,
    metadataFetched,
    dataPointsFetched,
    includeDatapoints,
  ]);

  useEffect(() => {
    setDownloading(false);
  }, [ids]);

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
      <Tooltip title="Download">
        <Button
          disabled={downloading}
          icon={downloading ? 'Loader' : 'Download'}
        />
      </Tooltip>
    </Dropdown>
  );
}

export default function DownloadButton({ ids, resourceType }: Props) {
  switch (resourceType) {
    case 'timeSeries':
      return <TimeseriesDownloadButton ids={ids} />;
    default:
      return <MetadataDownload ids={ids} resourceType={resourceType} />;
  }
}