/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu, Icon } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { getGroupsState, isAdmin } from 'store/groups/selectors';

import {
  SuiteActionsContainer,
  MenuContainer,
  MenuItemContent,
} from './elements';

interface Props {
  suiteItem: Suite;
  className?: string;
}
export const SuiteMenu: React.FC<Props> = ({ suiteItem, className }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const { ref, isComponentVisible, setIsComponentVisible } =
    useClickAwayListener(false);

  const metrics = useMetrics('SuiteMenu');

  const admin = useSelector(isAdmin);
  const { filter: groupsFilter } = useSelector(getGroupsState);

  const canEdit = admin && !groupsFilter?.length;

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    metrics.track(`OpenMenu`, {
      suiteKey: suiteItem?.key,
      suite: suiteItem?.title,
    });
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    modalProps: { suiteItem: Suite }
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    metrics.track(`Select_${modalType}`, {
      suiteKey: suiteItem?.key,
      suite: suiteItem?.title,
    });
    dispatch(modalOpen({ modalType, modalProps }));
  };

  return (
    <MenuContainer ref={ref} className={className}>
      <Button
        type="ghost"
        icon="EllipsisHorizontal"
        onClick={handleMenuOpen}
        aria-label="View more"
      />
      <SuiteActionsContainer>
        {isComponentVisible && (
          <Menu>
            <Menu.Item>
              <MenuItemContent
                className={canEdit ? 'share-action' : ''}
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'ShareLink', { suiteItem })
                }
              >
                <Icon type="Share" />
                Share suite
              </MenuItemContent>
            </Menu.Item>
            {canEdit && (
              <>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      handleOpenModal(event, 'EditSuite', { suiteItem })
                    }
                  >
                    <Icon type="Edit" />
                    Edit suite
                  </MenuItemContent>
                </Menu.Item>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      handleOpenModal(event, 'MoveSuite', { suiteItem })
                    }
                  >
                    <Icon type="Folder" />
                    Move suite to...
                  </MenuItemContent>
                </Menu.Item>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      handleOpenModal(event, 'DeleteSuite', {
                        suiteItem,
                      })
                    }
                  >
                    <Icon type="Delete" />
                    Delete suite
                  </MenuItemContent>
                </Menu.Item>
              </>
            )}
          </Menu>
        )}
      </SuiteActionsContainer>
    </MenuContainer>
  );
};
