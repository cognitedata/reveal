/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { ActionsContainer, MenuContainer, MenuItemContent } from './elements';

interface Props {
  dataItem: Suite;
}
export const SuiteMenu: React.FC<Props> = ({ dataItem }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const metrics = useMetrics('SuiteMenu');

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
    modalProps: { dataItem: Suite }
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    metrics.track(`Select_${modalType}`, {
      suiteKey: modalProps.dataItem?.key,
      suite: modalProps.dataItem?.title,
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
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'EditSuite', { dataItem })
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
                  handleOpenModal(event, 'DeleteSuite', { dataItem })
                }
              >
                Delete suite
              </MenuItemContent>
            </Menu.Item>
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'ShareBoard', { dataItem })
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
