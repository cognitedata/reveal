import { NptInternal } from 'domain/wells/npt/internal/types';

import React from 'react';

import { FlexRow } from 'styles/layout';

import { NptCodeDefinition } from '../../../../nptEvents/components/NptCodeDefinition';
import { NptEventAvatar } from '../../elements';
import {
  DetailCardBlockWrapper,
  NptCodeDefinitionWrapper,
  NptCodesDataWrapper,
  Title,
  Value,
} from '../elements';

import { ButtonHighlightEvent } from './ButtonHighlightEvent';
import { ButtonRemoveHighlightedEvent } from './ButtonRemoveHighlightedEvent';

export interface NptCodeDataBlockProps
  extends Pick<NptInternal, 'nptCode' | 'nptCodeDetail' | 'nptCodeColor'> {
  nptCodeDefinition?: string;
  isHighlighted?: boolean;
}

export const NptCodeDataBlock: React.FC<NptCodeDataBlockProps> = ({
  nptCode,
  nptCodeDetail,
  nptCodeColor,
  nptCodeDefinition,
  isHighlighted,
}) => {
  const renderActionButton = () => {
    if (isHighlighted) {
      return <ButtonRemoveHighlightedEvent />;
    }

    return <ButtonHighlightEvent />;
  };

  return (
    <DetailCardBlockWrapper flex>
      <FlexRow>
        <NptEventAvatar color={nptCodeColor} />

        <NptCodesDataWrapper>
          <Title>{nptCode}</Title>
          <Value>{nptCodeDetail}</Value>
        </NptCodesDataWrapper>

        <NptCodeDefinitionWrapper>
          <NptCodeDefinition nptCodeDefinition={nptCodeDefinition} />
        </NptCodeDefinitionWrapper>

        {renderActionButton()}
      </FlexRow>
    </DetailCardBlockWrapper>
  );
};
