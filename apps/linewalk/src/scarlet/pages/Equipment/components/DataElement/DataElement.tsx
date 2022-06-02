import { Checkbox, Icon, Tooltip } from '@cognite/cogs.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAppDispatch,
  useCheckedDataElementsState,
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
  getPrintedDataElementValue,
  isCalculatedDataElement,
} from 'scarlet/utils';

import * as Styled from './style';

type DataElementProps = {
  dataElement: DataElementType;
};

export const DataElement = ({ dataElement }: DataElementProps) => {
  const appDispatch = useAppDispatch();
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const [checked, setChecked] = useState(false);
  const currentCheckedState = useCheckedDataElementsState();
  const isCheckboxDisabled =
    !!currentCheckedState && currentCheckedState !== dataElement.state;

  const {
    primaryDetection,
    value,
    isCalculated,
    isDiscrepancy,
    isApproved,
    isOmitted,
    hasValue,
  } = useMemo(() => {
    const primaryDetection = getDataElementPrimaryDetection(dataElement);

    const value = getPrintedDataElementValue(
      primaryDetection?.value,
      dataElement.config.unit,
      dataElement.config.type
    );
    const isApproved = dataElement.state === DataElementState.APPROVED;
    const isOmitted = dataElement.state === DataElementState.OMITTED;

    const isDiscrepancy = getDataElementHasDiscrepancy(dataElement);
    const isCalculated = isCalculatedDataElement(dataElement);

    const hasValue = getIsDataElementValueAvailable(value);

    return {
      primaryDetection,
      value,
      isCalculated,
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
    <Styled.Container>
      <Checkbox
        disabled={isCheckboxDisabled}
        name={`data-element-${dataElement.id}`}
        checked={checked}
        onChange={toggle}
      />
      <Styled.Content
        isLink={!!primaryDetection?.boundingBox}
        onClick={zoomDetection}
      >
        <Styled.Label className="cogs-detail">
          {dataElement.config.label}
        </Styled.Label>
        {isOmitted ? (
          <Styled.DataContainer>
            <Styled.DataSource className="cogs-micro" isOmitted>
              IGN
            </Styled.DataSource>
            <Styled.Value secondary className="cogs-body-3 strong">
              {dataElement.stateReason || 'No comment'}
            </Styled.Value>
          </Styled.DataContainer>
        ) : (
          <>
            {!hasValue ? (
              <Styled.DataContainer>
                <Styled.DataSource className="cogs-micro">
                  {isCalculated ? 'CALC' : 'N/A'}
                </Styled.DataSource>
                <Styled.Value secondary className="cogs-body-3 strong">
                  No value
                </Styled.Value>
              </Styled.DataContainer>
            ) : (
              <Styled.DataContainer>
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
          <Styled.Button
            type="tertiary"
            icon="Checkmark"
            size="small"
            aria-label="Approve"
            onClick={onApprove}
          />
        )}
        {!isOmitted && (
          <Styled.Button
            type="tertiary"
            icon={isApproved ? 'EyeShow' : 'Edit'}
            size="small"
            aria-label={isApproved ? 'View' : 'Edit'}
            onClick={openDataElementCard}
          />
        )}
        {isOmitted && (
          <Styled.Button
            type="tertiary"
            icon="Restore"
            size="small"
            aria-label="Restore"
            onClick={onRestore}
          />
        )}
      </Styled.Actions>
    </Styled.Container>
  );
};
