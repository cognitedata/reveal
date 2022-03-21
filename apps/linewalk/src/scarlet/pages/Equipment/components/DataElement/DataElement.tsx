import { Icon } from '@cognite/cogs.js';
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
  Detection,
  DetectionType,
} from 'scarlet/types';
import {
  getDataElementPCMSDetection,
  getDataElementPrimaryDetection,
  getIsDataElementValueAvailable,
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
    const pcmsDetection = getDataElementPCMSDetection(dataElement);
    const value = primaryDetection?.value;
    const isApproved = dataElement.state === DataElementState.APPROVED;
    const isOmitted = dataElement.state === DataElementState.OMITTED;
    const isDiscrepancy =
      !isApproved &&
      Boolean(pcmsDetection) &&
      primaryDetection?.type !== DetectionType.PCMS &&
      value?.trim().toLocaleLowerCase() !==
        pcmsDetection?.value?.trim().toLocaleLowerCase();

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
              {`"${dataElement.stateReason?.trim() || 'No comment'}"`}
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
                <Styled.DataSource
                  isDiscrepancy={isDiscrepancy}
                  className="cogs-micro"
                >
                  {getDataSourceAcronym(primaryDetection!)}
                  {isDiscrepancy && <Icon type="WarningTriangle" size={8} />}
                </Styled.DataSource>
                <Styled.Value className="cogs-body-3 strong">
                  {value}
                </Styled.Value>
              </Styled.DataContainer>
            )}
          </>
        )}
      </Styled.Content>
      <Styled.Actions>
        {!isApproved && !isOmitted && hasValue && (
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

const getDataSourceAcronym = (detection: Detection) => {
  if (detection.type === DetectionType.PCMS) return 'PCMS';
  const type = detection.documentExternalId
    ?.toLocaleLowerCase()
    ?.split('.')[0]
    ?.split('_')[2];

  switch (type) {
    case 'nameplate':
      return 'NPL';
    case 'miscellaneous':
      return 'MISC';
    case 'mech drawing':
      return 'MECH';
  }

  return type?.toUpperCase();
};
