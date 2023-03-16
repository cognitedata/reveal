import { Icon } from '@cognite/cogs.js';
import { SourceIconContainer } from './elements';

export const SourceIcon = ({
  color,
  type,
}: {
  color: string;
  type: 'timeseries' | 'workflow';
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
        type={type === 'workflow' ? 'Function' : 'Timeseries'}
        aria-label={type === 'workflow' ? 'Workflow Function' : 'Timeseries'}
      />
    </SourceIconContainer>
  );
};
