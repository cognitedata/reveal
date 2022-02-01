import { Icon } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';
import { useAppDispatch, useDataPanelDispatch } from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataElementState,
  DataPanelActionType,
} from 'scarlet/types';

import * as Styled from './style';

type CardHeaderProps = {
  dataElement: DataElement;
};

export const CardHeader = ({ dataElement }: CardHeaderProps) => {
  const dataPanelDispatch = useDataPanelDispatch();
  const appDispatch = useAppDispatch();
  const [isMenuActive, setMenuActive] = useState(false);

  const onBackButton = () =>
    dataPanelDispatch({
      type: DataPanelActionType.CLOSE_DATA_ELEMENT,
    });

  const toggleMenu = () => setMenuActive((isActive) => !isActive);

  const onIgnore = () => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElement,
      state: DataElementState.OMITTED,
    });
    toggleMenu();
  };

  useEffect(() => {
    if (dataElement.state === DataElementState.OMITTED) {
      onBackButton();
    }
  }, [dataElement]);

  return (
    <Styled.Container>
      <Styled.BackButton icon="ArrowLeft" type="ghost" onClick={onBackButton}>
        <Styled.Label>{dataElement.label}</Styled.Label>
      </Styled.BackButton>
      <Styled.MenuWrapper>
        <Styled.MenuButton
          icon="EllipsisVertical"
          type="ghost"
          onClick={toggleMenu}
        />
        {isMenuActive && (
          <Styled.Menu>
            <Styled.MenuItem onClick={onIgnore}>
              <Icon type="WarningTriangle" /> Ignore field
            </Styled.MenuItem>
          </Styled.Menu>
        )}
      </Styled.MenuWrapper>
    </Styled.Container>
  );
};
