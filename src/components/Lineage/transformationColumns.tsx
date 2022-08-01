import { CSSProperties } from 'react';
import { stringCompare, getStringCdfEnv } from 'utils/shared';
import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import moment from 'moment';
import { Button, Icon, Popconfirm } from '@cognite/cogs.js';
import styled from 'styled-components';
import HiddenTransformation from './HiddenTranformation';
import { useTranslation } from 'common/i18n';

export const useTransformationsColumns = () => {
  const { t } = useTranslation();

  const transformationsColumns = (
    onDeleteTransformationClick: (transformation: any) => void
  ) => [
    {
      title: t('transform'),
      key: 'name',
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
      title: t('created'),
      key: 'created',
      render: (_text: string, transform: any) => {
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
      title: t('updated'),
      key: 'updated',
      render: (_text: string, transform: any) => {
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
      title: t('owner'),
      key: 'owner',
      render: (_text: string, transform: any) => {
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
      key: 'actions',
      render: (_: string, transform: any) => (
        <Popconfirm
          content={t('lineage-transformation-remove-confirmation')}
          onConfirm={() => onDeleteTransformationClick(transform)}
        >
          <Button icon="Delete" size="small" type="ghost-danger" />
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
