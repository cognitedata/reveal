import React, { FunctionComponent, PropsWithChildren } from 'react';
import { RunStatusUI } from 'model/Status';
import { Extpipe } from 'model/Extpipe';
import { calculateStatus } from 'utils/extpipeUtils';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import styled from 'styled-components';
import { FailedRunMessageIcon } from 'components/icons/FailedRunMessageIcon';
import { Collapse, Colors } from '@cognite/cogs.js';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { Hint } from 'styles/StyledForm';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';

const Grid = styled.div`
  display: flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 40%;
  align-items: center;
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  padding: 0.5rem 0;
`;
const Heading = styled(Row)`
  padding: 1rem 0 0.2rem 0;
`;
const ErrorWrapper = styled.div`
  svg {
    margin-right: 1rem;
  }
  .rc-collapse {
    .rc-collapse-item {
      .rc-collapse-header {
        border-bottom: none;
      }
    }
  }
`;

export const LATEST_RUN_HINT: Readonly<string> = `Status information from the lasts time the ${EXTRACTION_PIPELINE_LOWER} executed`;

export const TIME_OF_RUN: Readonly<string> = 'Time of latest run';
export const LATEST_ERROR: Readonly<string> = 'Latest error message';
export const TIME_SINCE_RUN: Readonly<string> = 'Time since latest run';
interface LatestRunProps {
  extpipe: Extpipe;
}

export const LatestRun: FunctionComponent<LatestRunProps> = ({
  extpipe,
}: PropsWithChildren<LatestRunProps>) => {
  const lastRun = calculateStatus({
    lastSuccess: extpipe.lastSuccess,
    lastFailure: extpipe.lastFailure,
  });
  const renderErrorMessage = (status: RunStatusUI, message?: string) => {
    if (status !== RunStatusUI.FAILURE) {
      return <></>;
    }
    return (
      <ErrorWrapper>
        {message ? (
          <Collapse accordion ghost expandIcon={() => <FailedRunMessageIcon />}>
            <Collapse.Panel
              header={`${message?.substring(0, 50)}${
                message.length >= 50 ? '...' : ''
              }`}
              key={1}
            >
              <p>{extpipe.lastMessage}</p>
            </Collapse.Panel>
          </Collapse>
        ) : (
          <i>No error message received</i>
        )}
      </ErrorWrapper>
    );
  };

  return (
    <>
      <StyledTitle2 id="latest-run-heading">Latest run</StyledTitle2>
      <Hint>{LATEST_RUN_HINT}</Hint>
      <Grid
        className="cogs-table extpipes-table"
        aria-label="Information about latest run"
        aria-describedby="latest-run-heading"
      >
        <Heading>
          <span />
          <span>{TableHeadings.LAST_RUN_STATUS}</span>
          <span>{TIME_OF_RUN}</span>
          <span>{TIME_SINCE_RUN}</span>
          <span>{LATEST_ERROR}</span>
        </Heading>
        <Row>
          <span>{TableHeadings.LATEST_RUN_TIME}</span>
          <span>
            <StatusMarker status={lastRun.status} />
          </span>
          <span>
            <TimeDisplay value={lastRun.time} />
          </span>
          <span>
            <TimeDisplay value={lastRun.time} relative />
          </span>
          <span>{renderErrorMessage(lastRun.status, extpipe.lastMessage)}</span>
        </Row>
      </Grid>
    </>
  );
};
