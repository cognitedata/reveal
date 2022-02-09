import { useEffect, useState } from 'react';
import { EquipmentComponent } from 'scarlet/types';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useAppState, useDataPanelState } from 'scarlet/hooks';

import { DataElementList } from '..';

import * as Styled from './style';

type ComponentListProps = {
  components: EquipmentComponent[];
  loading: boolean;
};

export const ComponentList = ({ components, loading }: ComponentListProps) => {
  const { equipmentName } = useAppState();
  const { visibleDataElement } = useDataPanelState();
  const [activeComponentIds, setActiveComponentIds] = useState<string[]>();

  const isEmptyList = components.length === 0;

  useEffect(() => {
    if (visibleDataElement?.componentId) {
      setActiveComponentIds([visibleDataElement?.componentId]);
    }
  }, [visibleDataElement]);

  if (loading) return null;

  return (
    <Styled.Container>
      {!isEmptyList && (
        <Styled.Collapse
          expandIcon={expandIcon}
          activeKey={activeComponentIds || components[0].id}
          onChange={setActiveComponentIds as any}
        >
          {components.map((component, i) => (
            <Styled.Panel
              header={
                <Styled.PanelHeader className="cogs-body-2">
                  {equipmentName}-{i + 1}
                </Styled.PanelHeader>
              }
              key={component.id}
            >
              <DataElementList
                data={component.componentElements}
                loading={false}
                skeletonAmount={20}
                sortedKeys={[]}
              />
            </Styled.Panel>
          ))}
        </Styled.Collapse>
      )}
    </Styled.Container>
  );
};

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownLarge"
      style={{
        marginRight: 0,
        width: '10px',
        transition: 'transform .2s',
        transform: `rotate(${!isActive ? 0 : -180}deg)`,
        flexShrink: 0,
      }}
    />
  );
};
