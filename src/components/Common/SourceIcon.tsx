import { Icon, IconType } from '@cognite/cogs.js';
import { SourceType } from 'models/chart/types';
import { SourceIconContainer } from './elements';

const SourceIconMap: Record<SourceType, IconType> = {
  workflow: 'Function',
  timeseries: 'Timeseries',
  scheduledCalculation: 'Clock',
};

export const SourceIcon = ({
  color,
  type,
}: {
  color: string;
  type: SourceType;
}) => {
  return (
    <SourceIconContainer
      justifyContent="center"
      alignItems="center"
      color={color}
    >
      <Icon
        size={12}
        style={{ marginRight: 0 }}
        type={type ? SourceIconMap[type] : 'Timeseries'}
        aria-label={type === 'workflow' ? 'Workflow Function' : 'Timeseries'}
      />
    </SourceIconContainer>
  );
};
