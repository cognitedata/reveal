import { useMemo, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { EquipmentComponent, EquipmentComponentGroup } from 'types';

import { ComponentToRename } from './ComponentToRename';
import * as Styled from './style';

type ComponentsRenamingProps = {
  group: EquipmentComponentGroup;
  components: EquipmentComponent[];
  loading: boolean;
  onClose: () => void;
  onRename: (names: Record<string, string>) => void;
};

export const ComponentsRenaming = ({
  group,
  components,
  onClose,
  loading,
  onRename,
}: ComponentsRenamingProps) => {
  const [newNames, setNewNames] = useState<Record<string, string>>({});

  const onChange = (componentId: string, value?: string) => {
    setNewNames((values) => {
      const newValues = { ...values };
      if (value === undefined) {
        delete newValues[componentId];
      } else {
        newValues[componentId] = value;
      }
      return newValues;
    });
  };

  const isError = useMemo(
    () => Object.values(newNames).some((value) => value.trim() === ''),
    [newNames]
  );

  const groupLabel = group.label.toLocaleLowerCase();
  const changedComponentIds = Object.keys(newNames);

  return (
    <Styled.Container>
      <Styled.TopBar className="cogs-body-3">
        <Styled.Button unstyled icon="Close" type="link" onClick={onClose}>
          Exit
        </Styled.Button>
        <Styled.SelectedInfo>
          {changedComponentIds.length === 0 && `No ${groupLabel}s changed`}
          {changedComponentIds.length === 1 && `1 ${groupLabel} changed`}
          {changedComponentIds.length > 1 &&
            `${changedComponentIds.length} ${groupLabel}s changed`}
        </Styled.SelectedInfo>
      </Styled.TopBar>
      <Styled.ComponentListWrapper>
        <Styled.ComponentList>
          {components.map((component) => (
            <Styled.Component key={component.id}>
              <ComponentToRename
                groupLabel={groupLabel}
                component={component}
                onChange={onChange}
              />
            </Styled.Component>
          ))}
        </Styled.ComponentList>
      </Styled.ComponentListWrapper>
      <Button
        type="primary"
        block
        onClick={() => onRename(newNames)}
        loading={loading}
        disabled={!changedComponentIds.length || isError}
      >
        Rename
      </Button>
    </Styled.Container>
  );
};
