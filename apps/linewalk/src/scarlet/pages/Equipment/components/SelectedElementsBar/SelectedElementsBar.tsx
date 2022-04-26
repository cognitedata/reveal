import { Button } from '@cognite/cogs.js';
import { useMemo } from 'react';
import {
  useAppDispatch,
  useAppState,
  useCheckedDataElementsState,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataElementState,
  DataPanelActionType,
} from 'scarlet/types';
import {
  getDataElementConfig,
  getDataElementHasDiscrepancy,
  getDataElementPrimaryDetection,
  getIsDataElementValueAvailable,
} from 'scarlet/utils';

import * as Styled from './style';

type SelectedElementsBarProps = {
  dataElements?: DataElement[];
};

export const SelectedElementsBar = ({
  dataElements = [],
}: SelectedElementsBarProps) => {
  const { equipmentConfig } = useAppState();
  const appDispatch = useAppDispatch();
  const dataPanelDispatch = useDataPanelDispatch();
  const currentCheckedState = useCheckedDataElementsState();
  const isElementWithoutValue = useMemo(
    () =>
      dataElements.some((dataElement) => {
        const primaryDetection = getDataElementPrimaryDetection(dataElement);
        const value = primaryDetection?.value;
        return !getIsDataElementValueAvailable(value);
      }),
    [dataElements]
  );

  const isElementWithDiscrepancy = useMemo(
    () =>
      dataElements.some((dataElement) => {
        const { unit, type } =
          getDataElementConfig(equipmentConfig.data, dataElement) ?? {};
        return getDataElementHasDiscrepancy(dataElement, unit, type);
      }),
    [equipmentConfig.data, dataElements]
  );

  const onUnselect = () => {
    dataPanelDispatch({ type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS });
  };

  const onApprove = () => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElements,
      state: DataElementState.APPROVED,
    });
  };

  const onIgnore = () => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElements,
      state: DataElementState.OMITTED,
    });
  };

  const onRestore = () => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElements,
      state: DataElementState.PENDING,
    });
  };

  return (
    <Styled.Container>
      <Styled.Label>
        {dataElements?.length === 1
          ? '1 data field selected'
          : `${dataElements?.length} data fields selected`}
      </Styled.Label>
      <Styled.Actions>
        {currentCheckedState === DataElementState.PENDING &&
          !isElementWithoutValue &&
          !isElementWithDiscrepancy && (
            <Button icon="Checkmark" iconPlacement="left" onClick={onApprove}>
              {dataElements?.length === 1 ? 'Approve value' : 'Approve values'}
            </Button>
          )}
        {[DataElementState.PENDING, DataElementState.APPROVED].includes(
          currentCheckedState
        ) && (
          <Button
            icon="Close"
            iconPlacement="left"
            variant={isElementWithoutValue ? 'default' : 'inverted'}
            onClick={onIgnore}
            style={
              !isElementWithoutValue ? { border: '1px solid white' } : undefined
            }
          >
            {dataElements?.length === 1 ? 'Ignore field' : 'Ignore fields'}
          </Button>
        )}
        {currentCheckedState === DataElementState.OMITTED && (
          <Button icon="Restore" iconPlacement="left" onClick={onRestore}>
            {dataElements?.length === 1 ? 'Restore field' : 'Restore fields'}
          </Button>
        )}
        <Button
          icon="Close"
          aria-label="Unselect data-fields"
          variant="inverted"
          onClick={onUnselect}
        />
      </Styled.Actions>
    </Styled.Container>
  );
};
