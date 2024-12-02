/*!
 * Copyright 2024 Cognite AS
 */

import { Flex, Input, TextLabel } from '@cognite/cogs.js';
import { type ReactNode } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { useSelectedPoi } from './useSelectedPoi';
import styled from 'styled-components';
import { AssetLabel } from '../../AssetLabel';

export const PoiInfoSection = (): ReactNode => {
  const { t } = useTranslation();
  const selectedPoi = useSelectedPoi();
  if (selectedPoi === undefined) {
    return undefined;
  }
  const { name, description } = selectedPoi.properties;
  return (
    <InfoSectionContainer direction="column" justifyContent="space-between" gap={8}>
      <Flex direction="column">
        <TextLabel text={t({ key: 'NAME' })} />
        <Input value={name} fullWidth />
      </Flex>
      <Flex direction="column">
        <TextLabel text={t({ key: 'DESCRIPTION' })} />
        <Input placeholder={t({ key: 'DESCRIPTION_PLACEHOLDER' })} value={description} fullWidth />
      </Flex>
      {selectedPoi.properties.instanceRef && (
        <Flex direction="column">
          <TextLabel text={t({ key: 'ASSET' })} />
          <AssetLabel instance={selectedPoi.properties.instanceRef} />
        </Flex>
      )}
    </InfoSectionContainer>
  );
};

const InfoSectionContainer = styled(Flex)`
  margin-top: 16px;
`;
