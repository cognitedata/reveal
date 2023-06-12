import React from 'react';

import { Chip } from '@cognite/cogs.js';

import { ChipType } from '../../../../../enums';

const classifierStatusLabels = (
  status?: string
): { text: string; type?: ChipType } => {
  switch (status) {
    case 'queuing':
    case 'training': {
      return {
        text: 'Training',
        type: ChipType.Warning,
      };
    }
    case 'finished': {
      return {
        text: 'Done',
        type: ChipType.Success,
      };
    }
    case 'failed': {
      return {
        text: 'Failed',
        type: ChipType.Danger,
      };
    }
    default: {
      return {
        text: 'Ready to run',
        type: ChipType.Neutral,
      };
    }
  }
};

interface Props {
  status?: string;
}

const TrainClassifierLabel: React.FC<Props> = ({ status }) => {
  const { text, type } = classifierStatusLabels(status);
  return <Chip size="small" label={text} type={type} />;
};

export default TrainClassifierLabel;
