/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { getGroupsState, isAdmin } from 'store/groups/selectors';
import { ActionsContainer, MenuContainer, MenuItemContent } from './elements';

interface Props {
  dataItem: Suite;
}
export const SuiteMenu: React.FC<Props> = ({ dataItem }) => {
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
      suiteKey: dataItem?.key,
      suite: dataItem?.title,
    });
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    modalProps: { suite: Suite }
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    metrics.track(`Select_${modalType}`, {
      suiteKey: modalProps.suite?.key,
      suite: modalProps.suite?.title,
    });
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
                    onClick={(event) =>
                      handleOpenModal(event, 'EditSuite', { suite: dataItem })
                    }
                  >
                    Edit suite
                  </MenuItemContent>
                </Menu.Item>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      handleOpenModal(event, 'DeleteSuite', { suite: dataItem })
                    }
                  >
                    Delete suite
                  </MenuItemContent>
                </Menu.Item>
              </>
            )}
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'ShareLink', { suite: dataItem })
                }
              >
                Share suite
              </MenuItemContent>
            </Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};
