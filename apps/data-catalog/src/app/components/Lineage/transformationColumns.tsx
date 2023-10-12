import { CSSProperties } from 'react';

import styled from 'styled-components';

import moment from 'moment';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { Button, Icon, Popconfirm } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import {
  CogsTableCellRenderer,
  getStringCdfEnv,
  stringCompare,
} from '../../utils';

import HiddenTransformation from './HiddenTranformation';

export const useTransformationsColumns = () => {
  const { t } = useTranslation();

  const transformationsColumns = (
    onDeleteTransformationClick: (transformation: any) => void
  ) => [
    {
      Header: t('transform'),
      id: 'name',
      accessor: 'name',
      sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => {
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
      Header: t('created'),
      id: 'created',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => {
        const { hidden, created } = transform;
        const cellText = hidden
          ? t('not-available')
          : moment(created).toString();
        return (
          <CellTransformation $hidden={hidden}>{cellText}</CellTransformation>
        );
      },
    },
    {
      Header: t('updated'),
      id: 'updated',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => {
        const { hidden, updated } = transform;
        const cellText = hidden
          ? t('not-available')
          : moment(updated).toString();
        return (
          <CellTransformation $hidden={hidden}>{cellText}</CellTransformation>
        );
      },
    },
    {
      Header: t('owner'),
      id: 'owner',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => {
        const { hidden, owner: _owner, ownerIsCurrentUser } = transform;
        const owner = ownerIsCurrentUser ? (
          <CellTransformation>
            <Icon type="User" /> {t('me')}
          </CellTransformation>
        ) : (
          _owner?.user ?? ''
        );
        const cellText = hidden ? t('not-available') : owner;
        return (
          <CellTransformation $hidden={transform.hidden}>
            {cellText}
          </CellTransformation>
        );
      },
    },
    {
      id: 'actions',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => (
        <Popconfirm
          content={t('lineage-transformation-remove-confirmation')}
          onConfirm={() => onDeleteTransformationClick(transform)}
        >
          <Button icon="Delete" size="small" type="ghost-destructive" />
        </Popconfirm>
      ),
    },
  ];

  return { transformationsColumns };
};

const CellTransformation = styled.div.attrs(
  ({ $hidden }: { $hidden?: boolean }) => {
    const style: CSSProperties = {};
    if ($hidden) style.fontStyle = 'italic';
    return { style };
  }
)<{ $hidden?: boolean }>`
  display: flex;
  align-items: center;
`;
