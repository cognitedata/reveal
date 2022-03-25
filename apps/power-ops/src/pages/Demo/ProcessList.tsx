import { Label } from '@cognite/cogs.js';

import { StyledTable } from './elements';
import { Process } from './Demo';

const ProcessList = (props: { processes: Process[] }) => {
  const { processes } = props;

  return (
    <StyledTable>
      {processes?.map((p) => {
        return (
          <div
            key={p.externalId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyItems: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <strong>{p.name}</strong>
              <br />
              <small>{p.externalId}</small>
            </div>
            <div style={{ textAlign: 'left', padding: '5px 10px' }}>
              <strong>Start Date/Time</strong>
              <br />
              {p.startTime}
            </div>
            <div style={{ textAlign: 'left', padding: '5px 10px' }}>
              <strong>End Date/Time</strong>
              <br />
              {p.endTime}
            </div>
            <div style={{ textAlign: 'left', padding: '5px 10px' }}>
              <strong>SHOP Run at</strong>
              <br />
              {p.time.toLocaleString()}
            </div>
            <div style={{ padding: '5px 10px' }}>
              <Label
                variant={
                  p.status === 'Bid Matrix Ready' ? 'success' : 'warning'
                }
                icon={p.status === 'Bid Matrix Ready' ? false : 'Loader'}
                iconPlacement="right"
              >
                {p.status}
              </Label>
            </div>
            {p.status === 'Bid Matrix Ready' && (
              <div style={{ padding: '5px 10px' }}>
                <Label
                  onClick={() => {
                    // setBidMatrixVisible(true)
                  }}
                  variant="unknown"
                >
                  View Bid Matrix
                </Label>
              </div>
            )}
          </div>
        );
      })}
    </StyledTable>
  );
};

export default ProcessList;
