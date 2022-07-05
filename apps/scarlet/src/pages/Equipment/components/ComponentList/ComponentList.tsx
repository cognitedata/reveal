import { useEffect, useRef, useState } from 'react';
import { EquipmentComponent } from 'types';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import { useDataPanelState } from 'hooks';
import { usePrevious } from 'hooks/usePrevious';

import { DataElementList } from '..';

import * as Styled from './style';

type ComponentListProps = {
  components: EquipmentComponent[];
  loading: boolean;
};

export const ComponentList = ({ components, loading }: ComponentListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleDataElement } = useDataPanelState();
  const [activeComponentIds, setActiveComponentIds] = useState<string[]>();
  const prevNumberComponents = usePrevious(components.length);
  const isEmptyList = components.length === 0;

  useEffect(() => {
    if (visibleDataElement?.componentId) {
      setActiveComponentIds([visibleDataElement?.componentId]);
    }
  }, [visibleDataElement]);

  useEffect(() => {
    if (
      prevNumberComponents !== undefined &&
      components.length - prevNumberComponents === 1
    ) {
      const newComponent = components[components.length - 1];
      setActiveComponentIds([newComponent.id]);
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          left: 0,
          behavior: 'smooth',
        });
      }, 300);
    }
  }, [components]);

  if (loading) return null;

  return (
    <Styled.Container ref={containerRef}>
      <Styled.ListContainer>
        {!isEmptyList && (
          <Styled.Collapse
            expandIcon={expandIcon}
            activeKey={activeComponentIds || components[0].id}
            onChange={setActiveComponentIds as any}
          >
            {components.map((component) => (
              <Styled.Panel
                header={
                  <Styled.PanelHeader className="cogs-body-2">
                    {component.name}
                  </Styled.PanelHeader>
                }
                key={component.id}
              >
                <DataElementList
                  data={component.componentElements}
                  loading={false}
                  skeletonLength={20}
                  partial
                />
              </Styled.Panel>
            ))}
          </Styled.Collapse>
        )}
      </Styled.ListContainer>
    </Styled.Container>
  );
};

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownLarge"
      aria-label="Toggle component"
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
