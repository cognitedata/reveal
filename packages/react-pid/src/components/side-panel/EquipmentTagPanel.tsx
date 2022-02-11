import React from 'react';
import { DiagramEquipmentTagInstance } from '@cognite/pid-tools';
import { Button, Collapse, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Pre } from './elements';

interface EquipmentTagPanelHeaderProps {
  equipmentTag: DiagramEquipmentTagInstance;
  deleteTag: (tagName: string) => void;
}

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1rem;
  align-items: center;
  width: 100%;
`;

const NextButton = styled(Button)`
  width: 100%;
`;

const EquipmentTagPanelHeader = ({
  equipmentTag: tag,
  deleteTag,
}: EquipmentTagPanelHeaderProps) => {
  const { equipmentTag } = tag;

  return (
    <CollapseHeader>
      <span>{equipmentTag}</span>
      <Icon onClick={() => deleteTag(equipmentTag)} type="Close" size={12} />
    </CollapseHeader>
  );
};

interface EquipmentTagPanelProps {
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
}

export const EquipmentTagPanel: React.FC<EquipmentTagPanelProps> = ({
  equipmentTags,
  setEquipmentTags,
  activeTagId,
  setActiveTagId,
}) => {
  const deleteTag = (equipmentTag: string) => {
    setEquipmentTags(
      equipmentTags.filter((tag) => tag.equipmentTag !== equipmentTag)
    );
  };

  return (
    <>
      <Collapse
        accordion
        ghost
        activeKey={activeTagId || undefined}
        onChange={(key) => setActiveTagId(key)}
      >
        {equipmentTags.map((tag) => (
          <Collapse.Panel
            header={
              <EquipmentTagPanelHeader
                equipmentTag={tag}
                deleteTag={deleteTag}
              />
            }
            key={tag.id}
          >
            <Pre>{JSON.stringify(tag, null, 2)}</Pre>
          </Collapse.Panel>
        ))}
      </Collapse>
      {activeTagId && (
        <NextButton onClick={() => setActiveTagId(null)}>Next tag</NextButton>
      )}
    </>
  );
};
