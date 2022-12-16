import { Infobar, Button } from '@cognite/cogs.js';
import sidecar from 'utils/sidecar';

export const EnvironmentInfoBar = () => {
  return (
    <Infobar type="warning">
      Dev environment
      <Button
        style={{ marginLeft: '16px' }}
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
      </Button>
    </Infobar>
  );
};
