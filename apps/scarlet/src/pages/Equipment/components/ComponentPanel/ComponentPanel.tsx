import { useState } from 'react';
import { useEquipmentComponentsByType } from 'hooks';
import { EquipmentComponentGroup } from 'types';

import { ComponentGroups, ComponentList } from '..';

import * as Styled from './style';

export const ComponentPanel = () => {
  const [currentGroup, setCurrentGroup] = useState<EquipmentComponentGroup>();

  const { components, subComponents, loading } = useEquipmentComponentsByType(
    currentGroup?.type
  );

  const groupLabel = currentGroup?.label.toLocaleLowerCase();

  return (
    <Styled.Container>
      <Styled.Header>
        <h4 className="cogs-title-4">Component Level</h4>
        <ComponentGroups group={currentGroup} onChange={setCurrentGroup} />
        {currentGroup && (
          <Styled.TopBar>
            <Styled.TopBarContent className="cogs-body-2">
              {components.length
                ? `${components.length} unique ${groupLabel}${
                    components.length !== 1 ? 's' : ''
                  }`
                : `No ${groupLabel}s`}
            </Styled.TopBarContent>
          </Styled.TopBar>
        )}
      </Styled.Header>
      {components.length > 0 && (
        <Styled.ContentWrapper>
          <ComponentList
            key={currentGroup?.type}
            components={components}
            loading={loading || !currentGroup}
          />
          {subComponents.length > 0 && (
            <>
              <h5 className="cogs-title-5">Sub Components</h5>
              <ComponentList
                key={`subgroup_${currentGroup?.type}`}
                components={subComponents}
                loading={loading || !currentGroup}
                expandFirstElem={false}
              />
            </>
          )}
        </Styled.ContentWrapper>
      )}
    </Styled.Container>
  );
};
