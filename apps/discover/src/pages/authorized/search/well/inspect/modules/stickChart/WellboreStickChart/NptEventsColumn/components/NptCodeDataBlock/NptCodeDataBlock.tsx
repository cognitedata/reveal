import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { FlexRow } from 'styles/layout';

import { NptCodeDefinition } from '../../../../../nptEvents/components/NptCodeDefinition';
import {
  DetailCardBlockTitle,
  DetailCardBlockValue,
  DetailCardBlockWrapper,
} from '../../../../components/DetailCard/elements';
import { NptEventAvatar } from '../../../elements';

import { NptCodeDefinitionWrapper, NptCodesDataWrapper } from './elements';

export interface NptCodeDataBlockProps
  extends Pick<
    NptInternalWithTvd,
    'nptCode' | 'nptCodeDetail' | 'nptCodeColor'
  > {
  nptCodeDefinition?: string;
}

export const NptCodeDataBlock: React.FC<NptCodeDataBlockProps> = ({
  nptCode,
  nptCodeDetail,
  nptCodeColor,
  nptCodeDefinition,
}) => {
  return (
    <DetailCardBlockWrapper flex>
      <FlexRow>
        <NptEventAvatar color={nptCodeColor} />

        <NptCodesDataWrapper>
          <DetailCardBlockTitle>{nptCode}</DetailCardBlockTitle>
          <DetailCardBlockValue>{nptCodeDetail}</DetailCardBlockValue>
        </NptCodesDataWrapper>

        <NptCodeDefinitionWrapper>
          <NptCodeDefinition nptCodeDefinition={nptCodeDefinition} />
        </NptCodeDefinitionWrapper>
      </FlexRow>
    </DetailCardBlockWrapper>
  );
};
