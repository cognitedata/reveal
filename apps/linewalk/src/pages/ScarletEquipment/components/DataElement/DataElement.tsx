import { DataElementProps } from '../../types';

import * as Styled from './style';

export const DataElement = ({ label, value, unit }: DataElementProps) => {
  const hasValue = value !== null && value !== undefined;

  return (
    <Styled.Container hasValue={hasValue}>
      <Styled.Label className="cogs-detail">{label}</Styled.Label>
      <Styled.Value className="cogs-body-3 strong" hasValue={hasValue}>
        {hasValue ? value + (unit ?? '') : 'No value'}
      </Styled.Value>
    </Styled.Container>
  );
};
