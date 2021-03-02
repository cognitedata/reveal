/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks';
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
  suite: Suite;
}
export const BoardMenu: React.FC<Props> = ({ board, suite }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);
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
    setIsComponentVisible(() => !isComponentVisible);
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    // TODO(dtc-255) change type
    modalProps: { board?: Board; suite?: Suite }
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsComponentVisible(() => !isComponentVisible);
    trackMetrics(modalType as string, modalProps);
    dispatch(modalOpen({ modalType, modalProps }));
  };

  return (
    <MenuContainer ref={ref}>
      <Button
        variant="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        onClick={handleMenuOpen}
      />
      <ActionsContainer>
        {isComponentVisible && (
          <Menu>
            {canEdit && (
              <>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    // TODO(dtc-256) avoid using callbacks with passed modal type and data
                    onClick={(event) =>
                      handleOpenModal(event, 'EditBoard', {
                        board,
                        suite,
                      })
                    }
                  >
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
                    Remove board
                  </MenuItemContent>
                </Menu.Item>
              </>
            )}
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'ShareLink', { board })
                }
              >
                Share board
              </MenuItemContent>
            </Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};
