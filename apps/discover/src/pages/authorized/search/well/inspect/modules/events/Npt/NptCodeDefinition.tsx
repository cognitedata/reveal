import { CSSProperties } from 'react';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { ACTION_MESSAGE, DEFINITION, NO_DEFINITION } from './constants';

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
            <>
              <div>{DEFINITION}</div>
              <div> {description}</div>
            </>
          ) : (
            <>
              <div>{NO_DEFINITION}</div>
              <div> {ACTION_MESSAGE}</div>
            </>
          )}
        </>
      }
      wrapped
    >
      <Icon style={iconStyle} type="Info" />
    </Tooltip>
  );
};
