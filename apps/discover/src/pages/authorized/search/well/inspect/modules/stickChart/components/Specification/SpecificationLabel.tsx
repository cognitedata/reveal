import * as React from 'react';

import { Label } from './elements';

export interface SpecificationLabelProps {
  label: string;
}

export const SpecificationLabel: React.FC<SpecificationLabelProps> = ({
  label,
}) => {
  return <Label>{label}</Label>;
};
