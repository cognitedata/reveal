import React from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';
import {
  AssetItem,
  AssetsItem,
  DataSetItem,
  DetailsItem,
  LabelsItem,
  ThreeDModelItem,
} from './DetailsItem';

export const GeneralDetails = ({
  children,
}: {
  children: React.ReactNode[];
}) => (
  <GeneralDetailsCard>
    <GeneralDetailsHeader>
      <Title level={5}>General</Title>
    </GeneralDetailsHeader>
    <GeneralDetailsContent>{children}</GeneralDetailsContent>
  </GeneralDetailsCard>
);
GeneralDetails.Item = DetailsItem;
GeneralDetails.DataSetItem = DataSetItem;
GeneralDetails.AssetsItem = AssetsItem;
GeneralDetails.AssetItem = AssetItem;
GeneralDetails.LabelsItem = LabelsItem;
GeneralDetails.ThreeDModelItem = ThreeDModelItem;

const GeneralDetailsCard = styled.div`
  width: 100%;
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;
`;

const GeneralDetailsHeader = styled.div`
  border-bottom: 1px solid var(--cogs-border--muted);
  padding: 16px 12px;
`;

const GeneralDetailsContent = styled.div`
  padding: 12px;
  display: grid;
  grid-gap: 8px;
  --max-columns: 2;
  /* Adjusting for the 8px grid-gap as well */
  grid-template-columns: repeat(
    auto-fit,
    minmax(max(500px, calc(100% / var(--max-columns) - 16px)), 1fr)
  );
`;
