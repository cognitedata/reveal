import { Skeleton } from '@cognite/cogs.js';

import * as Styled from './style';

type BreadcrumbBarProps = {
  unitName: string;
  equipmentName: string;
  pcmsQuery: any;
};

export const BreadcrumbBar = ({
  unitName,
  pcmsQuery,
  equipmentName,
}: BreadcrumbBarProps) => (
  <Styled.Container>
    <Styled.Crumb>Home</Styled.Crumb>
    <Styled.Crumb>{unitName}</Styled.Crumb>
    <Styled.Crumb>
      {pcmsQuery.loading ? (
        <Styled.SkeletonContainer>
          <Skeleton.Text />
        </Styled.SkeletonContainer>
      ) : (
        pcmsQuery.data?.equipment?.equip_group || equipmentName
      )}
    </Styled.Crumb>
  </Styled.Container>
);
