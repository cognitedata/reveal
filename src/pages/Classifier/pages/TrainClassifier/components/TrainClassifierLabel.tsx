import React from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';

const classifierStatusLabels = (
  status?: string
): { text: string; variant?: LabelVariants } => {
  switch (status) {
    case 'queuing':
    case 'training': {
      return {
        text: 'Training',
        variant: 'warning',
      };
    }
    case 'finished': {
      return {
        text: 'Done',
        variant: 'success',
      };
    }
    case 'failed': {
      return {
        text: 'Failed',
        variant: 'danger',
      };
    }
    default: {
      return {
        text: 'Ready to run',
        variant: 'default',
      };
    }
  }
};

interface Props {
  status?: string;
}

const TrainClassifierLabel: React.FC<Props> = ({ status }) => {
  const { text, variant } = classifierStatusLabels(status);
  return (
    <Label size="small" variant={variant} style={{ width: 'fit-content' }}>
      {text}
    </Label>
  );
};

export default TrainClassifierLabel;
