import React, { useState } from 'react';
import { TimeseriesFilter, Timeseries } from '@cognite/sdk';
import { SelectableItemsProps } from 'lib/CommonProps';
import { ResourceItem } from 'lib';
import {
  TimeseriesTable,
  TimeseriesSparklineCard,
} from 'lib/containers/Timeseries';
import { GridTable } from 'lib/components';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import { TimeseriesToolbar } from './TimeseriesToolbar';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  onClick,
  initialView = 'list',
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  ...selectionProps
}: {
  query?: string;
  initialView?: string;
  filter?: TimeseriesFilter;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: Timeseries) => void;
} & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>(initialView);

  return (
    <>
      <TimeseriesToolbar
        query={query}
        filter={filter}
        currentView={currentView}
        onViewChange={setCurrentView}
        count={count}
      />
      <ResultTableLoader<Timeseries>
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        type="timeSeries"
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...selectionProps}
      >
        {props =>
          currentView === 'grid' ? (
            <div style={{ flexGrow: 1 }}>
              <GridTable<Timeseries>
                {...props}
                cellHeight={360}
                minCellWidth={500}
                onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
                onItemClicked={timeseries => onClick(timeseries)}
                {...selectionProps}
                renderCell={cellProps => (
                  <TimeseriesSparklineCard {...cellProps} />
                )}
              />
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <TimeseriesTable
                {...props}
                onRowClick={file => {
                  onClick(file);
                  return true;
                }}
              />
            </div>
          )
        }
      </ResultTableLoader>
    </>
  );
};
