import { Icon, Tooltip } from '@cognite/cogs.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAppDispatch,
  useCheckedDataElementsState,
  useDataElementConfig,
  useDataPanelContext,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement as DataElementType,
  DataElementState,
  DataPanelActionType,
} from 'scarlet/types';
import {
  getDataElementHasDiscrepancy,
  getDataElementPrimaryDetection,
  getDetectionSourceAcronym,
  getIsDataElementValueAvailable,
  getPrettifiedDataElementValue,
} from 'scarlet/utils';

import * as Styled from './style';

type DataElementProps = {
  dataElement: DataElementType;
};

export const DataElement = ({ dataElement }: DataElementProps) => {
  const appDispatch = useAppDispatch();
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const [checked, setChecked] = useState(false);
  const dataElementConfig = useDataElementConfig(dataElement);
  const currentCheckedState = useCheckedDataElementsState();
  const isCheckboxDisabled =
    !!currentCheckedState && currentCheckedState !== dataElement.state;

  const {
    primaryDetection,
    value,
    isDiscrepancy,
    isApproved,
    isOmitted,
    hasValue,
  } = useMemo(() => {
    const primaryDetection = getDataElementPrimaryDetection(dataElement);

    const value = getPrettifiedDataElementValue(
      primaryDetection?.value,
      dataElementConfig!.unit,
      dataElementConfig!.type
    );
    const isApproved = dataElement.state === DataElementState.APPROVED;
    const isOmitted = dataElement.state === DataElementState.OMITTED;

    const isDiscrepancy = getDataElementHasDiscrepancy(
      dataElement,
      dataElementConfig?.unit,
      dataElementConfig?.type
    );

    const hasValue = getIsDataElementValueAvailable(value);

    return {
      primaryDetection,
      value,
      isDiscrepancy,
      isApproved,
      isOmitted,
      hasValue,
    };
  }, [dataElement]);

  const onApprove = () => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElements: [dataElement],
      state: DataElementState.APPROVED,
    });
  };

  const toggle = useCallback(
    (checked: boolean) => {
      setChecked(checked);
      dataPanelDispatch({
        type: DataPanelActionType.TOGGLE_DATA_ELEMENT,
        dataElement,
        checked,
      });
    },
    [dataPanelDispatch, dataElement]
  );

  const openDataElementCard = useCallback(() => {
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_DATA_ELEMENT,
      dataElement,
    });
  }, [appDispatch, dataElement]);

  const onRestore = useCallback(() => {
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElements: [dataElement],
      state: DataElementState.PENDING,
    });
  }, [appDispatch, dataElement]);

  useEffect(() => {
    const checked = dataPanelState.checkedDataElements.some(
      (item) => item.id === dataElement.id
    );

    setChecked(checked);
  }, [dataPanelState.checkedDataElements]);

  const zoomDetection = useCallback(() => {
    if (!primaryDetection?.boundingBox) return;

    dataPanelDispatch({
      type: DataPanelActionType.SET_ACTIVE_DETECTION,
      detection: primaryDetection,
    });
  }, []);

  return (
    <Styled.Container state={dataElement.state}>
      <Styled.CheckboxContainer>
        <Styled.Checkbox
          disabled={isCheckboxDisabled}
          name={`data-element-${dataElement.id}`}
          checked={checked}
          onChange={toggle}
          color={getCheckboxColor(dataElement.state)}
        />
      </Styled.CheckboxContainer>
      <Styled.Content>
        <Styled.Label className="cogs-detail">
          {dataElementConfig?.label}
        </Styled.Label>
        {isOmitted && (
          <Styled.DataContainer>
            <Styled.Value noValue className="cogs-body-3 strong">
              {dataElement.stateReason
                ? `"${dataElement.stateReason}"`
                : 'No comment'}
            </Styled.Value>
          </Styled.DataContainer>
        )}
        {!isOmitted && (
          <>
            {!hasValue ? (
              <Styled.DataContainer>
                <Styled.Value noValue className="cogs-body-3 strong">
                  No value
                </Styled.Value>
              </Styled.DataContainer>
            ) : (
              <Styled.DataContainer
                isLink={!!primaryDetection?.boundingBox}
                onClick={zoomDetection}
              >
                <Tooltip
                  disabled={!isDiscrepancy}
                  content={
                    isApproved
                      ? "PCMS value isn't the same as primary value."
                      : "PCMS value isn't the same as suggested data source."
                  }
                  wrapped
                >
                  <Styled.DataSource
                    isDiscrepancy={isDiscrepancy}
                    isApproved={isApproved}
                    className="cogs-micro"
                  >
                    {getDetectionSourceAcronym(primaryDetection!)}
                    {isDiscrepancy && !isApproved && (
                      <Icon type="WarningTriangle" size={8} />
                    )}
                    {isDiscrepancy && isApproved && (
                      <Icon type="Info" size={10} />
                    )}
                  </Styled.DataSource>
                </Tooltip>
                <Styled.Value className="cogs-body-3 strong">
                  {value}
                </Styled.Value>
              </Styled.DataContainer>
            )}
          </>
        )}
      </Styled.Content>
      <Styled.Actions>
        {!isApproved && !isOmitted && !isDiscrepancy && hasValue && (
          <Styled.Button aria-label="Approve" onClick={onApprove}>
            <Icon type="Checkmark" />
          </Styled.Button>
        )}
        {!isOmitted && (
          <Styled.Button
            aria-label={isApproved ? 'View' : 'Edit'}
            onClick={openDataElementCard}
          >
            <Icon type={isApproved ? 'EyeShow' : 'Edit'} />
          </Styled.Button>
        )}
        {isOmitted && (
          <Styled.Button aria-label="Restore" onClick={onRestore}>
            <Icon type="Restore" />
          </Styled.Button>
        )}
      </Styled.Actions>
    </Styled.Container>
  );
};

const getCheckboxColor = (state: DataElementState) => {
  switch (state) {
    case DataElementState.APPROVED:
      return '#6ED8BE';
    case DataElementState.OMITTED:
      return '#8C8C8C';
  }
  return '#FF6918';
};
