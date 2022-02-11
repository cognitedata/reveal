import { useEffect, useState } from 'react';
import { Icon, toast } from '@cognite/cogs.js';
import {
  useAddComponent,
  useAppDispatch,
  useAppState,
  useEquipmentComponentsByType,
} from 'scarlet/hooks';
import { AppActionType, EquipmentComponentGroup } from 'scarlet/types';

import { ComponentGroups, ComponentList, ComponentsDeletion } from '..';

import * as Styled from './style';

export const ComponentPanel = () => {
  const appDispatch = useAppDispatch();
  const appState = useAppState();
  const [currentGroup, setCurrentGroup] = useState<EquipmentComponentGroup>();
  const [isMenuActive, setMenuActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteView, setIsDeleteView] = useState(false);
  const { components, loading } = useEquipmentComponentsByType(
    currentGroup?.type
  );
  const toggleMenu = () => setMenuActive((isActive) => !isActive);
  const addComponent = useAddComponent();

  const groupLabel = currentGroup?.label.toLocaleLowerCase();

  useEffect(() => {
    setMenuActive(false);
    setIsDeleteView(false);
  }, [currentGroup]);

  useEffect(() => {
    if (isAdding && !appState.saveState.loading) {
      setIsAdding(false);
      if (appState.saveState.error) {
        toast.error(`Failed to add ${groupLabel}`);
      }
    }

    if (isDeleting && !appState.saveState.loading) {
      setIsDeleting(false);
      if (appState.saveState.error) {
        toast.error(`Failed to delete ${groupLabel}s`);
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

  const onDeleteComponents = (componentIds: string[]) => {
    setIsDeleting(true);
    appDispatch({
      type: AppActionType.DELETE_COMPONENTS,
      componentIds,
    });
  };

  return (
    <Styled.Container>
      <Styled.Header>
        <ComponentGroups group={currentGroup} onChange={setCurrentGroup} />

        {currentGroup && !isDeleteView && (
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
                area-label={
                  isMenuActive ? 'Close component menu' : 'Open component menu'
                }
              />
              {isMenuActive && (
                <Styled.Menu>
                  <Styled.MenuItem
                    remove
                    disabled={!components.length}
                    onClick={() => {
                      setIsDeleteView(true);
                      toggleMenu();
                    }}
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
      {isDeleteView ? (
        <ComponentsDeletion
          group={currentGroup!}
          components={components}
          loading={isDeleting}
          onClose={() => setIsDeleteView(false)}
          onDelete={onDeleteComponents}
        />
      ) : (
        <Styled.ContentWrapper>
          <Styled.Content>
            <ComponentList
              key={currentGroup?.type}
              components={components}
              loading={loading || !currentGroup}
            />
          </Styled.Content>
        </Styled.ContentWrapper>
      )}

      {(isAdding || isDeleting) && (
        <Styled.LoaderContainer>
          <Icon type="Loader" size={32} />
          <Styled.LoaderContent className="cogs-body-2 strong">
            {isAdding && 'Creating component...'}
            {isDeleting && 'Deleting components...'}
          </Styled.LoaderContent>
        </Styled.LoaderContainer>
      )}
    </Styled.Container>
  );
};
