import React from 'react';

import { Tooltip } from 'components/tooltip';

import { AssetIcon, SubLabel } from '../elements';

export interface Props {
  type: string;
  value: number;
  titleType: string;
}

export const AssetLabel: React.FC<Props> = React.memo(
  ({ type, value, titleType }) => {
    return (
      <>
        {value > 0 && (
          <Tooltip title={`${value} ${titleType}${value === 1 ? '' : 's'}`}>
            <SubLabel variant="unknown" size="small">
              <AssetIcon data-testid="asset-label" type={type} />
              {value}
            </SubLabel>
          </Tooltip>
        )}
      </>
    );
  }
);
