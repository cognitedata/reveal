import { DataElement as DataElementProps } from 'scarlet/types';

import * as Styled from './style';

export const DataElement = ({ label, value }: DataElementProps) => {
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <Styled.Container hasValue={hasValue}>
      <Styled.Label className="cogs-detail">{label}</Styled.Label>
      <Styled.Value className="cogs-body-3 strong" hasValue={hasValue}>
        {hasValue ? value : 'No value'}
      </Styled.Value>
    </Styled.Container>
  );
};
