import React, { FC } from 'react';

import styled from 'styled-components';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { Collapse, Title } from '@cognite/cogs.js';

import {
  SelectableItemsProps,
  EMPTY_OBJECT,
  APPLICATION_ID,
  ResourceType,
} from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsSearchResultQuery,
  useSequenceSearchResultQuery,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { DocumentPreview } from '../../Document';
import { FileInfo } from '../../Info';
import { ResourceSelection } from '../../ResourceSelector';
import {
  ASSETS,
  DETAILS,
  EVENTS,
  FILES,
  NO_DETAILS_AVAILABLE,
  PREVIEW,
  SEQUENCES,
  TIME_SERIES,
} from '../constant';
import { StyledCollapse } from '../elements';
import { getResourcesVisibility } from '../utils';

interface Props {
  documentId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
  selectedRows?: ResourceSelection;
  selectionMode?: 'single' | 'multiple';
  visibleResources?: ResourceType[];
}
export const DocumentDetails: FC<
  Props & Partial<Pick<SelectableItemsProps, 'onSelect'>>
> = ({
  documentId,
  isSelected,
  onSelect,
  onClose,
  selectionMode,
  selectedRows,
  visibleResources = [],
}) => {
  const {
    isLoading: isParentDocumentLoading,
    results: document,
    isFetched: isParentDocumentFetched,
  } = useDocumentSearchResultQuery({ filter: { internalId: documentId } });

  const {
    isAssetVisible,
    isFileVisible,
    isTimeseriesVisible,
    isSequenceVisible,
    isEventVisible,
  } = getResourcesVisibility(visibleResources);

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
    enabled: isQueryEnabled && isEventVisible,
  });

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
    data: timeseries,
  } = useTimeseriesSearchResultQuery({ filter }, undefined, {
    enabled: isQueryEnabled && isTimeseriesVisible,
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
    { enabled: isQueryEnabled && isFileVisible }
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
    { enabled: isQueryEnabled && isSequenceVisible }
  );

  const enableDetailTableSelection = selectionMode === 'multiple';
  return (
    <ResourceDetailsTemplate
      title={parentDocument?.name || ''}
      icon="Documents"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelect}
    >
      <StyledCollapse accordion ghost defaultActiveKey="document-preview">
        <Collapse.Panel key="document-preview" header={<h4>{PREVIEW}</h4>}>
          <PreviewWrapper>
            {parentDocument?.id && (
              <DocumentPreview
                key={parentDocument.id}
                id={`${APPLICATION_ID}-${parentDocument.id}`}
                applicationId={APPLICATION_ID}
                fileId={parentDocument?.id}
                creatable={false}
                contextualization={false}
              />
            )}
          </PreviewWrapper>
        </Collapse.Panel>
        <Collapse.Panel key="document-details" header={<h4>{DETAILS}</h4>}>
          {parentDocument ? (
            <FileInfo file={parentDocument as any} />
          ) : (
            <Title level={5}>{NO_DETAILS_AVAILABLE}</Title>
          )}
        </Collapse.Panel>
        {isAssetVisible && (
          <Collapse.Panel
            key="document-asset-detail"
            header={<h4>{ASSETS}</h4>}
          >
            <AssetDetailsTable
              id="asset-resource-document-detail-table"
              data={assets}
              isDataLoading={isParentDocumentLoading || isAssetsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.asset || EMPTY_OBJECT}
              onRowSelection={(updater, currentAssets) =>
                onSelect?.(updater, currentAssets, 'asset')
              }
            />
          </Collapse.Panel>
        )}
        {isTimeseriesVisible && (
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
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.timeSeries || EMPTY_OBJECT}
              onRowSelection={(updater, currentTimeseries) =>
                onSelect?.(updater, currentTimeseries, 'timeSeries')
              }
            />
          </Collapse.Panel>
        )}
        {isFileVisible && (
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
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.file || EMPTY_OBJECT}
              onRowSelection={(updater, currentFiles) =>
                onSelect?.(updater, currentFiles, 'file')
              }
            />
          </Collapse.Panel>
        )}
        {isEventVisible && (
          <Collapse.Panel
            key="document-events-detail"
            header={<h4>{EVENTS}</h4>}
          >
            <EventDetailsTable
              id="event-resource-document-detail-table"
              data={events}
              hasNextPage={hasEventNextPage}
              fetchMore={hasEventFetchNextPage}
              isDataLoading={isParentDocumentLoading || isEventsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.event || EMPTY_OBJECT}
              onRowSelection={(updater, currentEvents) =>
                onSelect?.(updater, currentEvents, 'event')
              }
            />
          </Collapse.Panel>
        )}
        {isSequenceVisible && (
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
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.sequence || EMPTY_OBJECT}
              onRowSelection={(updater, currentSequences) =>
                onSelect?.(updater, currentSequences, 'sequence')
              }
            />
          </Collapse.Panel>
        )}
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};

const PreviewWrapper = styled.div`
  height: 500px;
`;
