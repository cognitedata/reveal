import { CSSProperties } from 'react';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { Definition } from './Definition';
import { NoCodeDefinition } from './NoCodeDefinition';

export const NptCodeDefinition: React.FC<{
  nptCodeDefinition?: string;
  iconStyle?: CSSProperties;
}> = ({ nptCodeDefinition: description, iconStyle }) => {
  return (
    <Tooltip
      placement="right"
      content={
        <>
          {description ? (
            <Definition definition={description} />
          ) : (
            <NoCodeDefinition />
          )}
        </>
      }
      wrapped
    >
      <Icon style={iconStyle} type="Info" />
    </Tooltip>
  );
};
