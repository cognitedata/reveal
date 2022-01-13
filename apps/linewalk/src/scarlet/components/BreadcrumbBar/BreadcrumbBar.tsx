import { Skeleton } from '@cognite/cogs.js';
import { APIState, PCMSData } from 'scarlet/types';

import * as Styled from './style';

type BreadcrumbBarProps = {
  unitName: string;
  equipmentName?: string;
  pcms?: APIState<PCMSData>;
};

export const BreadcrumbBar = ({
  unitName,
  equipmentName,
  pcms,
}: BreadcrumbBarProps) => (
  <Styled.Container>
    <Styled.Crumb>P66 Berger</Styled.Crumb>
    <Styled.Crumb>{unitName}</Styled.Crumb>
    {pcms && (
      <Styled.Crumb>
        {pcms.loading ? (
          <Styled.SkeletonContainer>
            <Skeleton.Text />
          </Styled.SkeletonContainer>
        ) : (
          pcms.data?.equipment?.equip_group || equipmentName
        )}
      </Styled.Crumb>
    )}
  </Styled.Container>
);
