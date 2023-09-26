import React from 'react';

import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import {
  AssetItem,
  AssetsItem,
  DataSetItem,
  DetailsItem,
  LabelsItem,
  RootAssetItem,
  ThreeDModelItem,
} from './DetailsItem';

export const GeneralDetails = ({
  children,
}: {
  children: React.ReactNode[];
}) => {
  const { t } = useTranslation();

  const isPreview: boolean = window.location.pathname.includes('/search');

  return (
    <GeneralDetailsCard data-testid="general-details-card">
      <GeneralDetailsHeader>
        <Title level={5}>{t('GENERAL', 'General')}</Title>
      </GeneralDetailsHeader>
      <GeneralDetailsContent isPreview={isPreview}>
        {children}
      </GeneralDetailsContent>
    </GeneralDetailsCard>
  );
};
GeneralDetails.Item = DetailsItem;
GeneralDetails.DataSetItem = DataSetItem;
GeneralDetails.AssetsItem = AssetsItem;
GeneralDetails.AssetItem = AssetItem;
GeneralDetails.LabelsItem = LabelsItem;
GeneralDetails.ThreeDModelItem = ThreeDModelItem;
GeneralDetails.RootAssetItem = RootAssetItem;

const GeneralDetailsCard = styled.div`
  width: 100%;
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;
`;

const GeneralDetailsHeader = styled.div`
  border-bottom: 1px solid var(--cogs-border--muted);
  padding: 16px 12px;
`;

const GeneralDetailsContent = styled.div<{ isPreview: boolean }>`
  padding: 12px;
  display: grid;
  grid-gap: 4px;
  --max-columns: ${(props) => (props.isPreview ? 1 : 2)};
  /* Adjusting for the 8px grid-gap as well */
  grid-template-columns: repeat(
    auto-fit,
    minmax(max(330px, calc(100% / var(--max-columns) - 32px)), 1fr)
  );
`;
