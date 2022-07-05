import { useEffect } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { useAppState, useDataPanelState } from 'hooks';
import { EquipmentComponentGroup, EquipmentComponentType } from 'types';

import * as Styled from './style';

type ComponentGroupsProps = {
  group?: EquipmentComponentGroup;
  onChange: (group: EquipmentComponentGroup) => void;
};

export const ComponentGroups = ({ group, onChange }: ComponentGroupsProps) => {
  const { equipment, equipmentConfig } = useAppState();
  const { visibleDataElement } = useDataPanelState();
  let groups: EquipmentComponentGroup[] = [];
  if (equipment.data?.type && equipmentConfig.data?.equipmentTypes) {
    groups =
      Object.values(
        equipmentConfig.data?.equipmentTypes[equipment.data?.type]
          .componentTypes
      ) || [];
  }

  useEffect(() => {
    if (!group && groups.length && !visibleDataElement) {
      onChange(groups[0]);
    }
  }, [groups.length]);

  useEffect(() => {
    if (visibleDataElement?.componentId) {
      const component = equipment.data?.components.find(
        (component) => component.id === visibleDataElement?.componentId
      );
      const group = groups.find((g) => g.type === component?.type);
      if (group) onChange(group);
    }
  }, [visibleDataElement]);

  if (!group) return null;

  return (
    <SegmentedControl
      fullWidth
      currentKey={group.type}
      onButtonClicked={(value) =>
        onChange(
          groups.find((g) => g.type === (value as EquipmentComponentType))!
        )
      }
    >
      {groups.map(({ type, label }) => (
        <Styled.SegmentedControlButton key={type}>
          {label}s
        </Styled.SegmentedControlButton>
      ))}
    </SegmentedControl>
  );
};
