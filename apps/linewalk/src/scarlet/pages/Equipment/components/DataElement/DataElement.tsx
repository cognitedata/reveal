import { Icon } from '@cognite/cogs.js';
import { useAppDispatch } from 'scarlet/hooks';
import {
  AppActionType,
  DataElement as DataElementType,
  DataElementState,
} from 'scarlet/types';

import * as Styled from './style';

type DataElementProps = {
  dataElement: DataElementType;
};

export const DataElement = ({ dataElement }: DataElementProps) => {
  const { label, value, state } = dataElement;
  const appDispatch = useAppDispatch();

  const hasValue = value !== null && value !== undefined && value !== '';
  const isApproved = state === DataElementState.APPROVED;

  const showModal = (state: DataElementState) =>
    appDispatch({
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL,
      dataElement,
      state,
    });

  return (
    <Styled.Container hasValue={hasValue} state={state}>
      <Styled.Content>
        <Styled.Label className="cogs-detail">{label}</Styled.Label>
        <Styled.Value className="cogs-body-3 strong">
          {hasValue ? value : 'No value'}
        </Styled.Value>
      </Styled.Content>
      <Styled.Actions>
        {isApproved && (
          <Styled.Button aria-label="Approve" disabled>
            <Icon type="Checkmark" />
          </Styled.Button>
        )}

        {!isApproved && hasValue && (
          <Styled.Button
            aria-label="Approve"
            onClick={() => showModal(DataElementState.APPROVED)}
          >
            <Icon type="Checkmark" />
          </Styled.Button>
        )}

        <Styled.Button
          aria-label={isApproved ? 'View' : 'Edit'}
          onClick={() => console.log('Edit', dataElement)}
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
