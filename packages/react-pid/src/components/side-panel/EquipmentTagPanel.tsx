import React from 'react';
import { DiagramEquipmentTagInstance } from '@cognite/pid-tools';
import { Button, Collapse, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

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
  equipmentTag,
  deleteTag,
}: EquipmentTagPanelHeaderProps) => {
  const { name } = equipmentTag;

  return (
    <CollapseHeader>
      <span>
        {equipmentTag.name}
        {equipmentTag.description.length &&
          `, ${equipmentTag.description.join(', ')}`}
      </span>
      <Icon onClick={() => deleteTag(name)} type="Close" size={12} />
    </CollapseHeader>
  );
};

interface EquipmentTagPanelProps {
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagName: string | undefined;
  setActiveTagName: (arg: string | undefined) => void;
}

export const EquipmentTagPanel: React.FC<EquipmentTagPanelProps> = ({
  equipmentTags,
  setEquipmentTags,
  activeTagName,
  setActiveTagName,
}) => {
  const deleteTag = (name: string) => {
    setEquipmentTags(equipmentTags.filter((tag) => tag.name !== name));
  };

  return (
    <>
      <Collapse
        accordion
        ghost
        activeKey={activeTagName}
        onChange={(key) => setActiveTagName(key)}
      >
        {equipmentTags.map((tag) => (
          <Collapse.Panel
            header={
              <EquipmentTagPanelHeader
                equipmentTag={tag}
                deleteTag={deleteTag}
              />
            }
            key={tag.name}
          >
            <p>
              {`{
                labelIds: [${tag.labelIds.join(', ')}],
                lineNumbers: [${tag.lineNumbers.join(', ')}]
              }`}
            </p>
          </Collapse.Panel>
        ))}
      </Collapse>
      {activeTagName && (
        <NextButton onClick={() => setActiveTagName('')}>Next tag</NextButton>
      )}
    </>
  );
};
