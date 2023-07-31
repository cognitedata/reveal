import * as React from 'react';

import isUndefined from 'lodash/isUndefined';

import { Label, SpecificationWrapper } from './elements';

export interface SpecificationProps {
  label: string;
  value?: string | number;
}

export const Specification: React.FC<SpecificationProps> = ({
  label,
  value,
}) => {
  if (isUndefined(value)) {
    return null;
  }

  return (
    <SpecificationWrapper>
      <Label>{label}:</Label>
      <span>{value}</span>
    </SpecificationWrapper>
  );
};
