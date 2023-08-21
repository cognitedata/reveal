import React, { FC } from 'react';

import styled from 'styled-components';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { Collapse, Title } from '@cognite/cogs.js';
import { FileInfo as FileInfoType } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  SelectableItemsProps,
  EMPTY_OBJECT,
  APPLICATION_ID,
  ResourceType,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useEventsSearchResultQuery,
  useFileSearchQuery,
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
  closable?: boolean;
  onClose?: () => void;
  selectedRows?: ResourceSelection;
  selectionMode?: 'single' | 'multiple';
  visibleResources?: ResourceType[];
  isDocumentsApiEnabled?: boolean;
  showSelectButton?: boolean;
}
export const DocumentDetails: FC<
  Props & Partial<Pick<SelectableItemsProps, 'onSelect'>>
> = ({
  documentId,
  isSelected,
  onSelect,
  closable,
  onClose,
  selectionMode,
  selectedRows,
  visibleResources = [],
  isDocumentsApiEnabled = true,
  showSelectButton,
}) => {
  const {
    data: parentDocument,
    isFetched: isParentDocumentFetched,
    isLoading: isParentDocumentLoading,
  } = useCdfItem<FileInfoType>('files', {
    id: documentId,
  });

  const {
    isAssetVisible,
    isFileVisible,
    isTimeseriesVisible,
    isSequenceVisible,
    isEventVisible,
  } = getResourcesVisibility(visibleResources);

  const { t } = useTranslation();

  const assetIds = parentDocument?.assetIds || [];
  const isQueryEnabled = assetIds.length > 0;

  const filter = {
    assetSubtreeIds: assetIds.map((value) => ({
      value,
    })),
  };

  const { data: assets = [], isInitialLoading: isAssetsLoading } =
    useAssetsByIdQuery(
      assetIds.map((id) => ({ id })),
      { enabled: isParentDocumentFetched && !!assetIds && isQueryEnabled }
    );

  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isInitialLoading: isEventsLoading,
    data: events,
  } = useEventsSearchResultQuery({ eventsFilters: filter }, undefined, {
    enabled: isQueryEnabled && isEventVisible,
  });

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isInitialLoading: isTimeseriesLoading,
    data: timeseries,
  } = useTimeseriesSearchResultQuery({ filter }, undefined, {
    enabled: isQueryEnabled && isTimeseriesVisible,
  });

  const {
    results: documents = [],
    hasNextPage: hasDocumentsNextPage,
    fetchNextPage: hasDocumentsFetchNextPage,
    isInitialLoading: isDocumentsLoading,
  } = useFileSearchQuery(
    {
      filter: {
        assetSubtreeIds: assetIds.map((value) => ({
          id: value,
        })),
      },
      limit: 10,
    },
    { enabled: isQueryEnabled && isFileVisible }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isInitialLoading: isSequencesLoading,
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
      closable={closable}
      onClose={onClose}
      onSelectClicked={onSelect}
      showSelectButton={showSelectButton}
    >
      <StyledCollapse accordion ghost defaultActiveKey="document-preview">
        <Collapse.Panel
          key="document-preview"
          header={<h4>{t('PREVIEW_TAB_LABEL', PREVIEW)}</h4>}
        >
          <PreviewWrapper>
            {parentDocument?.id && (
              <DocumentPreview
                key={parentDocument.id}
                id={`${APPLICATION_ID}-${parentDocument.id}`}
                applicationId={APPLICATION_ID}
                fileId={parentDocument?.id}
                creatable={false}
                contextualization={false}
                isDocumentsApiEnabled={isDocumentsApiEnabled}
              />
            )}
          </PreviewWrapper>
        </Collapse.Panel>
        <Collapse.Panel
          key="document-details"
          header={<h4>{t('DETAILS', DETAILS)}</h4>}
        >
          {parentDocument ? (
            <FileInfo file={parentDocument as any} />
          ) : (
            <Title level={5}>
              {t('NO_DETAILS_AVAILABLE', NO_DETAILS_AVAILABLE)}
            </Title>
          )}
        </Collapse.Panel>
        {isAssetVisible && (
          <Collapse.Panel
            key="document-asset-detail"
            header={<h4>{t('ASSETS', ASSETS)}</h4>}
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
            header={<h4>{t('TIMESERIES', TIME_SERIES)}</h4>}
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
            header={<h4>{t('FILES', FILES)}</h4>}
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
            header={<h4>{t('EVENTS', EVENTS)}</h4>}
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
            header={<h4>{t('SEQUENCES', SEQUENCES)}</h4>}
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
