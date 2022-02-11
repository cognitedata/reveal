import { Button, Checkbox } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';
import { useComponentName } from 'scarlet/hooks';
import { EquipmentComponent, EquipmentComponentGroup } from 'scarlet/types';

import * as Styled from './style';

type ComponentsDeletionProps = {
  group: EquipmentComponentGroup;
  components: EquipmentComponent[];
  loading: boolean;
  onClose: () => void;
  onDelete: (componentIds: string[]) => void;
};

export const ComponentsDeletion = ({
  group,
  components,
  onClose,
  loading,
  onDelete,
}: ComponentsDeletionProps) => {
  const getComponentName = useComponentName();
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    []
  );

  useEffect(() => {
    setSelectedComponentIds((ids) =>
      ids.filter((id) => components.some((c) => c.id === id))
    );
  }, [components]);

  return (
    <Styled.Container>
      <Styled.TopBar className="cogs-body-3">
        <Styled.Button unstyled icon="Close" type="link" onClick={onClose}>
          Exit
        </Styled.Button>
        <Styled.SelectedInfo>
          {selectedComponentIds.length === 0 &&
            `No ${group.label.toLocaleLowerCase()}s selected`}
          {selectedComponentIds.length === 1 &&
            `1 ${group.label.toLocaleLowerCase()} selected`}
          {selectedComponentIds.length > 1 &&
            `${
              selectedComponentIds.length
            } ${group.label.toLocaleLowerCase()}s selected`}
        </Styled.SelectedInfo>
      </Styled.TopBar>
      <Styled.ComponentListWrapper>
        <Styled.ComponentList>
          {components.map((component) => (
            <Styled.Component
              key={component.id}
              checked={selectedComponentIds.includes(component.id)}
            >
              <Checkbox
                name={`component${component.id}`}
                onChange={(isChecked) => {
                  setSelectedComponentIds((ids) =>
                    isChecked
                      ? [...ids, component.id]
                      : ids.filter((id) => id !== component.id)
                  );
                }}
              >
                <Styled.ComponentContent>
                  <Styled.ComponentName className="cogs-body-3 strong">
                    {getComponentName(component)}
                  </Styled.ComponentName>
                  <Styled.ComponentFields className="cogs-micro">
                    {component.componentElements.length} fields
                  </Styled.ComponentFields>
                </Styled.ComponentContent>
              </Checkbox>
            </Styled.Component>
          ))}
        </Styled.ComponentList>
      </Styled.ComponentListWrapper>
      <Button
        type="danger"
        block
        onClick={() => onDelete(selectedComponentIds)}
        loading={loading}
        disabled={!selectedComponentIds.length}
      >
        Delete
      </Button>
    </Styled.Container>
  );
};
