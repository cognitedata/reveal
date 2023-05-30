import React, { FC } from 'react';
import { Collapse, Title } from '@cognite/cogs.js';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsSearchResultQuery,
  useSequenceSearchResultQuery,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceItem } from '@data-exploration-lib/core';
import { SequenceInfo } from '../../Info';
import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';

import {
  ASSETS,
  DETAILS,
  EVENTS,
  FILES,
  NO_DETAILS_AVAILABLE,
  SEQUENCES,
  TIME_SERIES,
} from '../constant';
import { StyledCollapse } from '../elements';

interface Props {
  sequenceId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const SequenceDetails: FC<Props> = ({
  sequenceId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const {
    isLoading: isParentSequenceLoading,
    data: sequence,
    isFetched: isSequenceFetched,
  } = useSequenceSearchResultQuery({
    filter: { internalId: sequenceId },
  });

  const parentSequence = sequence?.[0];

  const assetIds: number[] = parentSequence?.assetId
    ? [parentSequence.assetId]
    : [];
  const isQueryEnabled = assetIds.length > 0;

  const filter = {
    assetSubtreeIds: assetIds.map((value) => ({
      value,
    })),
  };

  const { data: assets = [], isLoading: isAssetsLoading } = useAssetsByIdQuery(
    assetIds.map((id) => ({ id })),
    { enabled: isSequenceFetched && !!assetIds && isQueryEnabled }
  );

  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isLoading: isEventsLoading,
    data: events,
  } = useEventsSearchResultQuery({ eventsFilters: filter }, undefined, {
    enabled: isQueryEnabled,
  });

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
    data: timeseries,
  } = useTimeseriesSearchResultQuery({ filter }, undefined, {
    enabled: isQueryEnabled,
  });

  const {
    hasNextPage: hasDocumentsNextPage,
    fetchNextPage: hasDocumentsFetchNextPage,
    isLoading: isDocumentsLoading,
    results: relatedDocuments = [],
  } = useDocumentSearchResultQuery(
    {
      filter,
    },
    { enabled: isQueryEnabled }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isLoading: isSequencesLoading,
    data: sequences = [],
  } = useSequenceSearchResultQuery(
    {
      filter,
    },
    undefined,
    { enabled: isQueryEnabled }
  );

  return (
    <ResourceDetailsTemplate
      title={parentSequence?.name || ''}
      icon="Sequences"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <StyledCollapse accordion ghost defaultActiveKey="sequence-details">
        <Collapse.Panel key="sequence-details" header={<h4>{DETAILS}</h4>}>
          {parentSequence ? (
            <SequenceInfo sequence={parentSequence} />
          ) : (
            <Title level={5}>{NO_DETAILS_AVAILABLE}</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel key="sequence-asset-detail" header={<h4>{ASSETS}</h4>}>
          <AssetDetailsTable
            id="asset-resource-sequence-detail-table"
            data={assets}
            isDataLoading={isParentSequenceLoading || isAssetsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="sequence-timeseries-detail"
          header={<h4>{TIME_SERIES}</h4>}
        >
          <TimeseriesDetailsTable
            id="timeseries-resource-sequence-detail-table"
            data={timeseries}
            hasNextPage={hasTimeseriesNextPage}
            fetchMore={hasTimeseriesFetchNextPage}
            isDataLoading={isParentSequenceLoading || isTimeseriesLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="sequence-documents-detail"
          header={<h4>{FILES}</h4>}
        >
          <FileDetailsTable
            id="documents-resource-sequence-detail-table"
            data={relatedDocuments}
            hasNextPage={hasDocumentsNextPage}
            fetchMore={hasDocumentsFetchNextPage}
            isDataLoading={isParentSequenceLoading || isDocumentsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel key="sequence-events-detail" header={<h4>{EVENTS}</h4>}>
          <EventDetailsTable
            id="event-resource-sequence-detail-table"
            data={events}
            hasNextPage={hasEventNextPage}
            fetchMore={hasEventFetchNextPage}
            isDataLoading={isParentSequenceLoading || isEventsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="sequence-sequence-detail"
          header={<h4>{SEQUENCES}</h4>}
        >
          <SequenceDetailsTable
            id="sequence-resource-sequence-detail-table"
            data={sequences}
            hasNextPage={hasSequencesNextPage}
            fetchMore={hasSequencesFetchNextPage}
            isDataLoading={isParentSequenceLoading || isSequencesLoading}
          />
        </Collapse.Panel>
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};
