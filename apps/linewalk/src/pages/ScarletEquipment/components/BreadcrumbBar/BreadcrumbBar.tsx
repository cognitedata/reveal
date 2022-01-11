import { Skeleton } from '@cognite/cogs.js';

import { useStorageState } from '../../hooks';

import * as Styled from './style';

type BreadcrumbBarProps = {
  unitName: string;
  equipmentName: string;
};

export const BreadcrumbBar = ({
  unitName,
  equipmentName,
}: BreadcrumbBarProps) => {
  const { pcms } = useStorageState();

  return (
    <Styled.Container>
      <Styled.Crumb>Home</Styled.Crumb>
      <Styled.Crumb>{unitName}</Styled.Crumb>
      <Styled.Crumb>
        {pcms.loading ? (
          <Styled.SkeletonContainer>
            <Skeleton.Text />
          </Styled.SkeletonContainer>
        ) : (
          pcms.data?.equipment?.equip_group || equipmentName
        )}
      </Styled.Crumb>
    </Styled.Container>
  );
};
