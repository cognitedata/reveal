import { Infobar } from '@cognite/cogs.js-v9';
import sidecar from 'utils/sidecar';

import { StyledButton } from './elements';

export const EnvironmentInfoBar = () => {
  return (
    <Infobar type="warning">
      Dev environment
      <StyledButton
        icon="ArrowUpRight"
        iconPlacement="right"
        size="small"
        type="tertiary"
        onClick={() =>
          window.open(
            `https://power-ops.${sidecar.cdfCluster}.cogniteapp.com${window.location.pathname}${window.location.search}`
          )
        }
      >
        Open Prod
      </StyledButton>
    </Infobar>
  );
};
