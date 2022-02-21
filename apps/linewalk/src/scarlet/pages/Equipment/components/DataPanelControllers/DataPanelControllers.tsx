import { DataElementOrigin, DataPanelActionType } from 'scarlet/types';
import { useDataPanelContext } from 'scarlet/hooks';

import * as Styled from './style';

export const DataPanelControllers = () => {
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const isEquipment =
    dataPanelState.currentOrigin === DataElementOrigin.EQUIPMENT;
  const isComponent =
    dataPanelState.currentOrigin === DataElementOrigin.COMPONENT;

  return (
    <Styled.Container>
      <Styled.ToggleButton
        type="tertiary"
        icon={dataPanelState.isVisible ? 'PanelRight' : 'PanelLeft'}
        aria-label={
          dataPanelState.isVisible
            ? 'Close panel with data elements'
            : 'Open panel with data elements'
        }
        onClick={() =>
          dataPanelDispatch({ type: DataPanelActionType.TOGGLE_PANEL })
        }
      />
      {dataPanelState.isVisible && (
        <Styled.TabList>
          <Styled.TabItem
            disabled={isEquipment}
            onClick={() =>
              dataPanelDispatch({
                type: DataPanelActionType.SET_CURRENT_ORIGIN,
                origin: DataElementOrigin.EQUIPMENT,
              })
            }
          >
            <Styled.TabItemContent>Equipment</Styled.TabItemContent>
          </Styled.TabItem>
          <Styled.TabItem
            disabled={isComponent}
            onClick={() =>
              dataPanelDispatch({
                type: DataPanelActionType.SET_CURRENT_ORIGIN,
                origin: DataElementOrigin.COMPONENT,
              })
            }
          >
            <Styled.TabItemContent>Component</Styled.TabItemContent>
          </Styled.TabItem>
        </Styled.TabList>
      )}
    </Styled.Container>
  );
};
