import { Button } from '@cognite/cogs.js';

import { Tooltip } from './Tooltip';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / tooltip',
  component: Tooltip,
};

export const full = () => (
  <div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <div>
          <Tooltip title="Add" placement="top">
            <div>top</div>
          </Tooltip>
        </div>
      </div>
      <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
        <div
          style={{
            marginRight: 150,
            marginTop: 25,
            marginBottom: 25,
          }}
        >
          <Tooltip title="Add" placement="left">
            <div>left</div>
          </Tooltip>
        </div>
        <div
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginTop: 25,
            marginBottom: 25,
          }}
        >
          <div>
            <Tooltip title="Add" placement="right">
              <div>right</div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <div>
          <Tooltip title="Add" placement="bottom">
            <div>bottom</div>
          </Tooltip>
        </div>
      </div>
    </div>
    <div>
      <Tooltip title="Add" placement="bottom">
        <Button aria-label="Button">Button</Button>
      </Tooltip>
    </div>
  </div>
);
