import React, { useState, useMemo } from 'react';

import {
  DASH,
  DATA_EXPLORATION_COMPONENT,
  isValidUrl,
  useDebounceTrackUsage,
  useMetrics,
} from '@data-exploration-lib/core';
import { ColumnDef, SortingState } from '@tanstack/react-table';

import { Button, Title, Link } from '@cognite/cogs.js';

import { TooltipCell, Table } from '..';

import {
  FilterContainer,
  FilterInput,
  MetadataCard,
  MetadataHeader,
  MetadataTableContainer,
} from './elements';

// TODO  Needs to be removed once implemented in our library
interface DataSource {
  id: string;
  key: string;
  value: string;
}

export function Metadata({ metadata }: { metadata?: { [k: string]: string } }) {
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const trackUsage = useMetrics();
  const track = useDebounceTrackUsage();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const columns = useMemo(
    () =>
      [
        {
          header: 'Key',
          accessorKey: 'key',
          maxSize: undefined,
          cell: ({ getValue }) => {
            return <TooltipCell text={getValue<string>() || DASH} />;
          },
        },
        {
          header: 'Value',
          accessorKey: 'value',
          maxSize: undefined,
          cell: ({ getValue }) => {
            const value = getValue<string>();
            if (isValidUrl(value)) {
              return (
                <Link alignVertically="left" href={value} target="_blank">
                  {value}
                </Link>
              );
            }

            return <TooltipCell text={value} />;
          },
        },
      ] as ColumnDef<DataSource>[],
    []
  );

  const filteredMetadata = useMemo(
    () =>
      metadata
        ? Object.entries(metadata)
            .filter(([key, value]) => {
              if (hideEmpty && !value) {
                return false;
              }
              return (
                query.length === 0 ||
                key.toLowerCase().includes(query.toLowerCase()) ||
                value.toLowerCase().includes(query.toLowerCase())
              );
            })
            .map(([key, value]) => [key.trim(), value.trim()])
            .map((item) => ({
              key: item[0],
              id: item[0],
              value: item[1],
            }))
        : [],
    [metadata, query, hideEmpty]
  );
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  const handleOnClickHideEmpty = () => {
    setHideEmpty((hideEmptyValue) => {
      trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.METADATA_HIDE_EMPTY, {
        visible: !hideEmptyValue,
      });
      return !hideEmptyValue;
    });
  };

  const handleFilterInputOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    setQuery(event.target.value);

    track(DATA_EXPLORATION_COMPONENT.SEARCH.METADATA_FILTER, {
      value: event.target.value,
    });
  };

  return (
    <MetadataCard>
      <MetadataHeader>
        <Title level={5}>Metadata</Title>
        <FilterContainer>
          <FilterInput
            value={query}
            placeholder="Filter"
            size="small"
            variant="noBorder"
            onChange={handleFilterInputOnChange}
          />
          <Button
            type="secondary"
            size="small"
            onClick={handleOnClickHideEmpty}
          >
            {hideEmpty ? 'Show' : 'Hide'} empty
          </Button>
        </FilterContainer>
      </MetadataHeader>
      <MetadataTableContainer>
        <Table<DataSource>
          id="metadata-table"
          data={filteredMetadata}
          enableCopying
          enableSorting
          sorting={sorting}
          onSort={setSorting}
          manualSorting={false}
          columns={columns}
        />
      </MetadataTableContainer>
    </MetadataCard>
  );
}
