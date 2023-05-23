import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';
import { ResourceType } from '@data-exploration-lib/core';

import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsSearchResultQuery,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceDetailsTemplate } from '@data-exploration/components';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import {
  EventDetailsTable,
  FileDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { AssetInfo } from '../../Info';

interface Props {
  assetId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const AssetDetails: FC<Props> = ({
  assetId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const onOpenResources = (resourceType: ResourceType, id: number) => {
    const link = createLink(`/explore/search/${resourceType}/${id}`);
    window.open(link, '_blank');
  };
  const filter = { assetSubtreeIds: [{ value: assetId }] };
  const {
    results: relatedFiles = [],
    hasNextPage: fileHasNextPage,
    fetchNextPage: fileFetchNextPage,
    isLoading: isFileLoading,
  } = useDocumentSearchResultQuery({
    filter,
    limit: 10,
  });
  const {
    data: relatedTimeseries = [],
    hasNextPage: timeseriesHasNextPage,
    fetchNextPage: timeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
  } = useTimeseriesSearchResultQuery({
    filter,
    limit: 10,
  });

  const {
    data: relatedEvents = [],
    hasNextPage: eventHasNextPage,
    fetchNextPage: eventFetchNextPage,
    isLoading: isEventLoading,
  } = useEventsSearchResultQuery({
    eventsFilters: filter,
    limit: 10,
  });

  return (
    <ResourceDetailsTemplate
      title={asset ? asset.name : ''}
      icon="Assets"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <Collapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="details" header={<h4>Details</h4>}>
          {asset ? (
            <AssetInfo asset={asset} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Files</h4>}>
          <Wrapper>
            <FileDetailsTable
              id="related-file-asset-details"
              data={relatedFiles}
              hasNextPage={fileHasNextPage}
              fetchMore={fileFetchNextPage}
              isLoadingMore={isFileLoading}
              onRowClick={(file) => onOpenResources('file', file.id)}
            />
          </Wrapper>
        </Collapse.Panel>

        <Collapse.Panel header={<h4>Timeseries</h4>}>
          <Wrapper>
            <TimeseriesDetailsTable
              id="related-timeseries-asset-details"
              data={relatedTimeseries}
              onRowClick={(timeseries) =>
                onOpenResources('timeSeries', timeseries.id)
              }
              fetchMore={timeseriesFetchNextPage}
              hasNextPage={timeseriesHasNextPage}
              isLoadingMore={isTimeseriesLoading}
            />
          </Wrapper>
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Events</h4>}>
          <Wrapper>
            <EventDetailsTable
              id="related-event-asset-details"
              data={relatedEvents}
              onRowClick={(event) => onOpenResources('event', event.id)}
              fetchMore={eventFetchNextPage}
              hasNextPage={eventHasNextPage}
              isLoadingMore={isEventLoading}
            />
          </Wrapper>
        </Collapse.Panel>
      </Collapse>
    </ResourceDetailsTemplate>
  );
};

const Wrapper = styled.div`
  max-height: 240px;
  overflow: auto;
`;
