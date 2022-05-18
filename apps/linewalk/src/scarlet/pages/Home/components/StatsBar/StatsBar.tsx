import { Skeleton } from '@cognite/cogs.js';
import { useMemo } from 'react';

import { EquipmentListItem, EquipmentStatus } from '../EquipmentList/types';

import * as Styled from './style';

type StatusBarProps = {
  loading: boolean;
  equipmentList?: EquipmentListItem[];
};

export const StatusBar = ({ loading, equipmentList = [] }: StatusBarProps) => {
  const stats = useMemo(
    () =>
      equipmentList.reduce(
        (result, equipment) => ({
          ...result,
          [equipment.status]: result[equipment.status] + 1,
        }),
        {
          [EquipmentStatus.NOT_STARTED]: 0,
          [EquipmentStatus.ONGOING]: 0,
          [EquipmentStatus.COMPLETED]: 0,
        }
      ),
    [equipmentList]
  );

  return (
    <Styled.Container>
      <Styled.Card>
        <Styled.Label>All equipment</Styled.Label>
        <Styled.Value>
          {loading
            ? valueSkeleton
            : equipmentList.length.toLocaleString('en-US')}
        </Styled.Value>
      </Styled.Card>
      <Styled.Card>
        <Styled.Label>Not started</Styled.Label>
        <Styled.Value>
          {loading
            ? valueSkeleton
            : stats[EquipmentStatus.NOT_STARTED].toLocaleString('en-US')}
        </Styled.Value>
      </Styled.Card>
      <Styled.Card>
        <Styled.Label>Ongoing</Styled.Label>
        <Styled.Value>
          {loading
            ? valueSkeleton
            : stats[EquipmentStatus.ONGOING].toLocaleString('en-US')}
        </Styled.Value>
      </Styled.Card>
      <Styled.Card>
        <Styled.Label>Completed</Styled.Label>
        <Styled.Value>
          {loading
            ? valueSkeleton
            : stats[EquipmentStatus.COMPLETED].toLocaleString('en-US')}
        </Styled.Value>
      </Styled.Card>
    </Styled.Container>
  );
};

const valueSkeleton = (
  <Skeleton.Rectangle height="18px" width="80px" style={{ margin: '0' }} />
);
