/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Menu, Icon, Dropdown } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupsState, isAdmin } from 'store/groups/selectors';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Board, Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import assign from 'lodash/assign';
import { ActionsContainer, MenuContainer, MenuItemContent } from './elements';

interface Props {
  board: Board;
  suite?: Suite;
}
export const BoardMenu: React.FC<Props> = ({ board, suite }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('BoardMenu');

  const admin = useSelector(isAdmin);
  const { filter: groupsFilter } = useSelector(getGroupsState);

  const canEdit = admin && !groupsFilter?.length;

  const trackMetrics = (
    name: string,
    modalProps: { board?: Board; suite?: Suite }
  ) => {
    const { suite: suiteItem, board: boardItem } = modalProps;
    const props = assign(
      {},
      suiteItem ? { suiteKey: suiteItem.key, suite: suiteItem.title } : null,
      boardItem ? { boardKey: boardItem.key, board: boardItem.title } : null
    );
    metrics.track(`Select_${name}`, props);
  };

  const handleMenuOpen = (event: React.MouseEvent) => {
    // prevent from cliking on link
    event.preventDefault();
    // prevent from calling quick access click handler
    event.stopPropagation();
    trackMetrics('OpenMenu', { board, suite });
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    modalProps: { board?: Board; suite?: Suite }
  ) => {
    event.preventDefault();
    event.stopPropagation();
    trackMetrics(modalType as string, modalProps);
    dispatch(modalOpen({ modalType, modalProps }));
  };

  const renderMenuContent = () => (
    <ActionsContainer>
      <Menu>
        <Menu.Item>
          <MenuItemContent
            className={canEdit ? 'share-action' : ''}
            role="button"
            tabIndex={0}
            onClick={(event) => handleOpenModal(event, 'ShareLink', { board })}
          >
            <Icon type="Share" />
            Share board
          </MenuItemContent>
        </Menu.Item>
        {canEdit && (
          <>
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'EditBoard', {
                    board,
                    suite,
                  })
                }
              >
                <Icon type="Edit" />
                Edit board
              </MenuItemContent>
            </Menu.Item>
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'DeleteBoard', { board, suite })
                }
              >
                <Icon type="Trash" />
                Remove board
              </MenuItemContent>
            </Menu.Item>
          </>
        )}
      </Menu>
    </ActionsContainer>
  );

  return (
    <MenuContainer onClick={handleMenuOpen} className="cogs-btn-ghost">
      <Dropdown
        content={renderMenuContent()}
        appendTo={document.body}
        hideOnClick
      >
        <Icon type="MoreOverflowEllipsisHorizontal" />
      </Dropdown>
    </MenuContainer>
  );
};
