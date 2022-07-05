import { useEffect, useState } from 'react';
import { Button, Icon, toast } from '@cognite/cogs.js';
import {
  useAddComponent,
  useAppDispatch,
  useAppState,
  useEquipmentComponentsByType,
} from 'hooks';
import { AppActionType, EquipmentComponentGroup } from 'types';

import {
  ComponentGroups,
  ComponentList,
  ComponentsDeletion,
  ComponentsRenaming,
} from '..';

import * as Styled from './style';

export const ComponentPanel = () => {
  const appDispatch = useAppDispatch();
  const appState = useAppState();
  const [currentGroup, setCurrentGroup] = useState<EquipmentComponentGroup>();
  const [isMenuActive, setMenuActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteView, setIsDeleteView] = useState(false);
  const [isRenameView, setIsRenameView] = useState(false);
  const { components, loading } = useEquipmentComponentsByType(
    currentGroup?.type
  );
  const toggleMenu = () => setMenuActive((isActive) => !isActive);
  const addComponent = useAddComponent();

  const groupLabel = currentGroup?.label.toLocaleLowerCase();

  useEffect(() => {
    setMenuActive(false);
    setIsDeleteView(false);
    setIsRenameView(false);
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
      } else {
        setIsDeleteView(false);
        toast.success(`Successfully deleted ${groupLabel}s`);
      }
    }

    if (isRenaming && !appState.saveState.loading) {
      setIsRenaming(false);
      if (appState.saveState.error) {
        toast.error(`Failed to rename ${groupLabel}s`);
      } else {
        setIsRenameView(false);
        toast.success(`Successfully renamed ${groupLabel}s`);
      }
    }
  }, [appState.saveState.loading]);

  const onAddComponent = () => {
    setIsAdding(true);
    setMenuActive(false);
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

  const onRenameComponents = (names: { [componentId: string]: string }) => {
    const components = Object.keys(names).map((id) => ({
      id,
      name: names[id],
    }));
    setIsRenaming(true);
    appDispatch({
      type: AppActionType.UPDATE_COMPONENTS,
      components,
    });
  };

  return (
    <Styled.Container>
      <Styled.Header>
        <h4 className="cogs-title-4">Component Level</h4>
        <ComponentGroups group={currentGroup} onChange={setCurrentGroup} />

        {currentGroup && !isDeleteView && !isRenameView && (
          <Styled.TopBar>
            <Styled.TopBarContent className="cogs-body-2">
              {components.length
                ? `${components.length} unique ${groupLabel}${
                    components.length !== 1 ? 's' : ''
                  }`
                : `No ${groupLabel}s`}
            </Styled.TopBarContent>

            <Styled.MenuWrapper>
              <Styled.MenuButton
                icon="EllipsisHorizontal"
                type="ghost"
                onClick={toggleMenu}
                aria-label={
                  isMenuActive ? 'Close component menu' : 'Open component menu'
                }
              />
              {isMenuActive && (
                <Styled.Menu>
                  <Styled.MenuItem
                    disabled={!components.length}
                    onClick={() => {
                      setIsDeleteView(true);
                      toggleMenu();
                    }}
                  >
                    <Styled.RemoveLabel>
                      <Icon type="Delete" /> Delete {groupLabel}
                    </Styled.RemoveLabel>
                  </Styled.MenuItem>
                  <Styled.MenuItem onClick={onAddComponent}>
                    <Icon type="Add" /> Add new {groupLabel}
                  </Styled.MenuItem>
                  <Styled.MenuItem
                    disabled={!components?.length}
                    onClick={() => {
                      setIsRenameView(true);
                      toggleMenu();
                    }}
                  >
                    <Icon type="Edit" /> Edit {groupLabel} names
                  </Styled.MenuItem>
                </Styled.Menu>
              )}
            </Styled.MenuWrapper>
          </Styled.TopBar>
        )}
      </Styled.Header>
      {isDeleteView && (
        <ComponentsDeletion
          group={currentGroup!}
          components={components}
          loading={isDeleting}
          onClose={() => setIsDeleteView(false)}
          onDelete={onDeleteComponents}
        />
      )}

      {isRenameView && (
        <ComponentsRenaming
          group={currentGroup!}
          components={components}
          loading={isDeleting}
          onClose={() => setIsRenameView(false)}
          onRename={onRenameComponents}
        />
      )}

      {!isDeleteView && !isRenameView && components.length > 0 && (
        <Styled.ContentWrapper>
          <ComponentList
            key={currentGroup?.type}
            components={components}
            loading={loading || !currentGroup}
          />
        </Styled.ContentWrapper>
      )}
      {!isDeleteView && !isRenameView && !components.length && !loading && (
        <Styled.AddButtonContainer>
          <Button
            type="tertiary"
            icon="Add"
            iconPlacement="left"
            onClick={onAddComponent}
            block
          >
            Add new {groupLabel}
          </Button>
        </Styled.AddButtonContainer>
      )}

      {(isAdding || isDeleting || isRenaming) && (
        <Styled.LoaderContainer>
          <Icon type="Loader" size={32} />
          <Styled.LoaderContent className="cogs-body-2 strong">
            {isAdding && 'Creating component...'}
            {isDeleting && 'Deleting components...'}
            {isRenaming && 'Renaming components...'}
          </Styled.LoaderContent>
        </Styled.LoaderContainer>
      )}
    </Styled.Container>
  );
};
