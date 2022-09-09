import { Body, Flex, Tag, Tooltip } from '@cognite/cogs.js';
import { HighlightCell, TimeDisplay } from 'components';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetNewTable';
import { uniqueId } from 'lodash';
import React from 'react';
import { Column } from 'react-table';
import styled from 'styled-components';

export interface ResourceTableHashMap {
  [key: string]: Column<AssetWithRelationshipLabels>;
}

export const ResourceTableColumns: ResourceTableHashMap = {
  name: {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ value }) => <HighlightCell text={value} />,
  },
  description: {
    Header: 'Description',
    accessor: 'description',
    Cell: ({ value }) => <HighlightCell text={value} />,
  },
  externalId: {
    Header: 'External ID',
    accessor: 'externalId',
    Cell: ({ value }) => <HighlightCell text={value} />,
  },
  createdTime: {
    Header: 'Created Time',
    accessor: 'createdTime',
    Cell: ({ value }) => (
      <Body level={2}>
        <TimeDisplay value={value} />
      </Body>
    ),
  },
  relationshipLabels: {
    Header: 'Relationship Labels',
    accessor: 'relationshipLabels',
    Cell: ({ value }: { value: string[] }) => (
      <Flex gap={2} wrap="wrap">
        {value?.map((label: string) => (
          <Tooltip content={label} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>{label}</StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
    maxWidth: 250,
  },
  relation: {
    Header: 'Relationship Description(Source/Target)',
    accessor: 'relation',
  },
  labels: {
    Header: 'Labels',
    accessor: 'labels',
    Cell: ({ value }) => (
      <Flex gap={2} wrap="wrap">
        {value?.map(label => (
          <Tooltip content={label.externalId} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>
              {label.externalId}
            </StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
    width: 200,
  },
  lastUpdatedTime: {
    accessor: 'lastUpdatedTime',
    Header: 'Last updated',
    Cell: ({ value }) => (
      <Body level={2}>
        <TimeDisplay value={value} relative withTooltip />
      </Body>
    ),
  },
  parentExternalId: {
    Header: 'Parent External ID',
    accessor: 'parentExternalId',
  },
};

const StyledTag = styled(Tag)`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
