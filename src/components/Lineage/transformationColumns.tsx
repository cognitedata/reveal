import React from 'react';
import { stringCompare, getStringCdfEnv } from 'utils/utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import moment from 'moment';
import { Button, Icon, Popconfirm } from '@cognite/cogs.js';
import styled from 'styled-components';
import HiddenTransformation from './HiddenTranformation';

const transformationsColumns = (
  onDeleteTransformationClick: (transformation: any) => void
) => [
  {
    key: 'name',
    title: 'Transform',
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
    render: (_text: string, transform: any) => {
      const onTransformationClick = () =>
        trackEvent(
          'DataSets.LineageFlow.Clicked on an external transformation'
        );
      if (transform.hidden)
        return <HiddenTransformation transformation={transform.storedData} />;
      const env = getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : '';
      const href = `/${sdk.project}/transformations/${transform.id}${env}`;
      return (
        <a
          onClick={onTransformationClick}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {transform.name}
        </a>
      );
    },
  },
  {
    key: 'created',
    title: 'Created',
    render: (_text: string, transform: any) => {
      const { hidden, created } = transform;
      const cellText = hidden ? 'Not available' : moment(created).toString();
      return (
        <CellTransformation $hidden={hidden}>{cellText}</CellTransformation>
      );
    },
  },
  {
    key: 'updated',
    title: 'Updated',
    render: (_text: string, transform: any) => {
      const { hidden, updated } = transform;
      const cellText = hidden ? 'Not available' : moment(updated).toString();
      return (
        <CellTransformation $hidden={hidden}>{cellText}</CellTransformation>
      );
    },
  },
  {
    key: 'owner',
    title: 'Owner',
    render: (_text: string, transform: any) => {
      const { hidden, owner: _owner, ownerIsCurrentUser } = transform;
      const owner = ownerIsCurrentUser ? (
        <CellTransformation>
          <Icon type="User" /> me
        </CellTransformation>
      ) : (
        _owner?.user ?? ''
      );
      const cellText = hidden ? 'Not available' : owner;
      return (
        <CellTransformation $hidden={transform.hidden}>
          {cellText}
        </CellTransformation>
      );
    },
  },
  {
    key: 'actions',
    render: (_: string, transform: any) => (
      <Popconfirm
        content="Are you sure you want to remove this transformation from this data set?"
        onConfirm={() => onDeleteTransformationClick(transform)}
      >
        <Button icon="Delete" size="small" type="ghost-danger" />
      </Popconfirm>
    ),
  },
];

export default transformationsColumns;

const CellTransformation = styled.div.attrs(
  ({ $hidden }: { $hidden?: boolean }) => {
    const style: React.CSSProperties = {};
    if ($hidden) style.fontStyle = 'italic';
    return { style };
  }
)<{ $hidden?: boolean }>`
  display: flex;
  align-items: center;
`;
