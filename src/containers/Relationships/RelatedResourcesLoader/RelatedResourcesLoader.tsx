import React, { useMemo } from 'react';
import { Flex, Icon } from '@cognite/cogs.js';
import { Loader, Select, SpacedRow, TableProps } from 'components';
import { SelectableItemsProps } from 'CommonProps';
import { ResourceType, ResourceItem } from 'types';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import {
  RelatedResourceType,
  useRelatedResourceResults,
} from 'hooks/RelatedResourcesHooks';
import styled from 'styled-components';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export type RelatedResourcesLoaderProps = {
  relatedResourceType: RelatedResourceType;
  type: ResourceType;
  parentResource: ResourceItem;
};

export const RelatedResourcesLoader = <T extends Resource>({
  relatedResourceType,
  type,
  parentResource,
  isSelected = () => false,
  children,
  selectionMode = 'none',
  onSelect = () => {},
  ...props
}: {
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SelectableItemsProps> &
  RelatedResourcesLoaderProps) => {
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetched,
    isIdle,
    isFetching,
    items,
    relationshipLabelOptions,
    onChangeLabelValue,
    labelValue,
  } = useRelatedResourceResults<T>(relatedResourceType, type, parentResource);

  const selectedIds = useMemo(
    () =>
      (items || [])
        .filter(el => isSelected({ type, id: el.id }))
        .map(el => el.id),
    [items, isSelected, type]
  );

  if (!isFetched && !isIdle) {
    return <Loader />;
  }

  return (
    <>
      <Flex alignItems="center">
        <h4>Relationship Labels:</h4>
        <SelectWrapper>
          <Select
            creatable
            options={relationshipLabelOptions.map(option => ({
              label: option,
              value: option,
            }))}
            onChange={newValue => {
              onChangeLabelValue(
                newValue
                  ? (newValue as OptionsType<OptionTypeBase>).map(
                      el => el.value
                    )
                  : undefined
              );
            }}
            value={labelValue?.map(el => ({
              label: el.externalId,
              value: el.externalId,
            }))}
            isMulti
            isSearchable
            isClearable
          />
        </SelectWrapper>
      </Flex>
      {children({
        ...props,
        onEndReached: () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        footerHeight: isFetching ? 20 : 0,
        footerRenderer: (
          <SpacedRow>
            <div className="spacer" />
            <Icon type="Loader" />
            <div className="spacer" />
          </SpacedRow>
        ),
        selectedIds,
        selectionMode,
        onRowSelected: item => onSelect({ type, id: item.id }),
        data: items as T[] | undefined,
      })}
    </>
  );
};

const SelectWrapper = styled.div`
  width: 225px;
  margin: 20px;
`;
