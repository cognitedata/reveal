import { useEffect, useState } from 'react';
import { Icon, toast } from '@cognite/cogs.js';
import {
  useAddComponent,
  useAppState,
  useEquipmentComponentsByType,
} from 'scarlet/hooks';
import { EquipmentComponentGroup } from 'scarlet/types';

import { ComponentGroups, ComponentList } from '..';

import * as Styled from './style';

export const ComponentPanel = () => {
  const appState = useAppState();
  const [currentGroup, setCurrentGroup] = useState<EquipmentComponentGroup>();
  const [isMenuActive, setMenuActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { components, loading } = useEquipmentComponentsByType(
    currentGroup?.type
  );
  const toggleMenu = () => setMenuActive((isActive) => !isActive);
  const addComponent = useAddComponent();

  const groupLabel = currentGroup?.label.toLocaleLowerCase();

  useEffect(() => setMenuActive(false), [currentGroup]);

  useEffect(() => {
    if (isAdding && !appState.saveState.loading) {
      setIsAdding(false);
      if (appState.saveState.error) {
        toast.error(`Failed to add ${groupLabel}`);
      }
    }
  }, [appState.saveState.loading]);

  const onAddComponent = () => {
    setIsAdding(true);
    toggleMenu();
    try {
      addComponent(currentGroup!.type);
    } catch (e: any) {
      setIsAdding(false);
      toast.error(e?.message || `Failed to add ${groupLabel}`);
    }
  };

  return (
    <Styled.Container>
      <Styled.Header>
        <ComponentGroups group={currentGroup} onChange={setCurrentGroup} />

        {currentGroup && (
          <Styled.TopBar>
            <Styled.TopBarContent className="cogs-body-2">
              {`${components.length} unique ${groupLabel}${
                components.length !== 1 ? 's' : ''
              }`}
            </Styled.TopBarContent>

            <Styled.MenuWrapper>
              <Styled.MenuButton
                icon="EllipsisHorizontal"
                type="ghost"
                onClick={toggleMenu}
              />
              {isMenuActive && (
                <Styled.Menu>
                  <Styled.MenuItem
                    remove
                    onClick={() => console.log('clicked delete')}
                  >
                    <Icon type="Delete" /> Delete {groupLabel}
                  </Styled.MenuItem>
                  <Styled.MenuItem onClick={onAddComponent}>
                    <Icon type="Add" /> Add new {groupLabel}
                  </Styled.MenuItem>
                </Styled.Menu>
              )}
            </Styled.MenuWrapper>
          </Styled.TopBar>
        )}
      </Styled.Header>
      <Styled.ContentWrapper>
        <Styled.Content>
          <ComponentList
            key={currentGroup?.type}
            components={components}
            loading={loading || !currentGroup}
          />
        </Styled.Content>
      </Styled.ContentWrapper>
      {isAdding && (
        <Styled.LoaderContainer>
          <Icon type="Loader" size={32} />
          <Styled.LoaderContent className="cogs-body-2 strong">
            {isAdding && 'Creating component...'}
          </Styled.LoaderContent>
        </Styled.LoaderContainer>
      )}
    </Styled.Container>
  );
};
