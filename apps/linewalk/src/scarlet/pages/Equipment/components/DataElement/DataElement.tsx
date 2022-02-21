import { Icon } from '@cognite/cogs.js';
import {
  useAppDispatch,
  useDataElementConfig,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement as DataElementType,
  DataElementState,
  DataPanelActionType,
} from 'scarlet/types';
import { getDataElementValue } from 'scarlet/utils';

import * as Styled from './style';

type DataElementProps = {
  dataElement: DataElementType;
};

export const DataElement = ({ dataElement }: DataElementProps) => {
  const { state } = dataElement;
  const appDispatch = useAppDispatch();
  const dataPanelDispatch = useDataPanelDispatch();
  const value = getDataElementValue(dataElement);
  const dataElementConfig = useDataElementConfig(dataElement);

  const hasValue = value !== null && value !== undefined && value !== '';
  const isApproved = state === DataElementState.APPROVED;

  const showModal = (state: DataElementState) =>
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElement,
      state,
    });

  const openDataElementCard = (dataElement: DataElementType) =>
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_DATA_ELEMENT,
      dataElement,
    });

  return (
    <Styled.Container hasValue={hasValue} state={state}>
      <Styled.Content>
        <Styled.Label className="cogs-detail">
          {dataElementConfig?.label}
        </Styled.Label>
        <Styled.Value className="cogs-body-3 strong">
          {hasValue ? value : 'No value'}
        </Styled.Value>
      </Styled.Content>
      <Styled.Actions>
        <Styled.Button
          aria-label={isApproved ? 'View' : 'Edit'}
          onClick={() => openDataElementCard(dataElement)}
        >
          <Icon type={isApproved ? 'EyeShow' : 'Edit'} />
        </Styled.Button>

        {!isApproved && !hasValue && (
          <Styled.Button
            aria-label="Omit"
            onClick={() => showModal(DataElementState.OMITTED)}
          >
            <Icon type="Close" />
          </Styled.Button>
        )}
      </Styled.Actions>
    </Styled.Container>
  );
};
