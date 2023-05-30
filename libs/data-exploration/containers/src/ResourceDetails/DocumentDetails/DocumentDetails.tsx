import React, { FC } from 'react';

import { ResourceDetailsTemplate } from '@data-exploration/components';
import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsSearchResultQuery,
  useSequenceSearchResultQuery,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import { Collapse, Title } from '@cognite/cogs.js';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { FileInfo } from '../../Info';
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
  documentId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const DocumentDetails: FC<Props> = ({
  documentId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const {
    isLoading: isParentDocumentLoading,
    results: document,
    isFetched: isParentDocumentFetched,
  } = useDocumentSearchResultQuery({ filter: { internalId: documentId } });

  const parentDocument = document?.[0];

  const assetIds = parentDocument?.assetIds || [];
  const isQueryEnabled = assetIds.length > 0;

  const filter = {
    assetSubtreeIds: assetIds.map((value) => ({
      value,
    })),
  };

  const { data: assets = [], isLoading: isAssetsLoading } = useAssetsByIdQuery(
    assetIds.map((id) => ({ id })),
    { enabled: isParentDocumentFetched && !!assetIds && isQueryEnabled }
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
    results: documents = [],
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
      title={parentDocument?.name || ''}
      icon="Documents"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <StyledCollapse accordion ghost defaultActiveKey="document-details">
        <Collapse.Panel key="document-details" header={<h4>{DETAILS}</h4>}>
          {parentDocument ? (
            <FileInfo file={parentDocument as any} />
          ) : (
            <Title level={5}>{NO_DETAILS_AVAILABLE}</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel key="document-asset-detail" header={<h4>{ASSETS}</h4>}>
          <AssetDetailsTable
            id="asset-resource-document-detail-table"
            data={assets}
            isDataLoading={isParentDocumentLoading || isAssetsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="document-timeseries-detail"
          header={<h4>{TIME_SERIES}</h4>}
        >
          <TimeseriesDetailsTable
            id="timeseries-resource-document-detail-table"
            data={timeseries}
            hasNextPage={hasTimeseriesNextPage}
            fetchMore={hasTimeseriesFetchNextPage}
            isDataLoading={isParentDocumentLoading || isTimeseriesLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="document-documents-detail"
          header={<h4>{FILES}</h4>}
        >
          <FileDetailsTable
            id="documents-resource-document-detail-table"
            data={documents}
            hasNextPage={hasDocumentsNextPage}
            fetchMore={hasDocumentsFetchNextPage}
            isDataLoading={isParentDocumentLoading || isDocumentsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel key="document-events-detail" header={<h4>{EVENTS}</h4>}>
          <EventDetailsTable
            id="event-resource-document-detail-table"
            data={events}
            hasNextPage={hasEventNextPage}
            fetchMore={hasEventFetchNextPage}
            isDataLoading={isParentDocumentLoading || isEventsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="document-sequence-detail"
          header={<h4>{SEQUENCES}</h4>}
        >
          <SequenceDetailsTable
            id="sequence-resource-document-detail-table"
            data={sequences}
            hasNextPage={hasSequencesNextPage}
            fetchMore={hasSequencesFetchNextPage}
            isDataLoading={isParentDocumentLoading || isSequencesLoading}
          />
        </Collapse.Panel>
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};
