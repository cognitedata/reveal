import React, { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { Button } from '@cognite/cogs.js';
import { baseCacheKey, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { ResourceType, convertResourceType } from 'lib/types';
import { InternalId, Timeseries } from '@cognite/sdk';

type Props = {
  ids: InternalId[];
  resourceType: ResourceType;
};

function MetadataDownload({ ids, resourceType }: Props) {
  const [downloading, setDownloading] = useState(false);
  const { data: metadata = [], isFetched } = useCdfItems(
    convertResourceType(resourceType),
    ids,
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
      <Button
        variant="outline"
        disabled={downloading}
        icon={downloading ? 'Loading' : 'Download'}
      >
        Download
      </Button>
    </Dropdown>
  );
}

function TimeseriesDownloadButton({ ids }: Pick<Props, 'ids'>) {
  const sdk = useSDK();
  const [includeDatapoints, setIncludeDatpoints] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const limit = 100000;
  const { data: metadata = [], isFetched: metadataFetched } = useCdfItems<
    Timeseries
  >('timeseries', ids, {
    enabled: downloading,
  });
  const { data: datapoints = [], isFetched: dataPointsFetched } = useQuery(
    [...baseCacheKey('timeseries'), 'datapoints', ids, limit],
    () =>
      Promise.all(
        ids.map(({ id }) =>
          sdk.datapoints
            .retrieve({ items: [{ id }], limit })
            .then(r => r[0].datapoints)
        )
      ),
    { enabled: downloading && includeDatapoints }
  );

  const metadataIncDatapoints =
    metadataFetched && dataPointsFetched
      ? metadata.map((d, i) => ({
          ...d,
          datapoints: datapoints[i] || [],
        }))
      : [];

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
      <Button
        variant="outline"
        disabled={downloading}
        icon={downloading ? 'Loading' : 'Download'}
      >
        Download
      </Button>
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
