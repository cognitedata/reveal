import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Badge } from '@cognite/cogs.js';
import { StyledTooltip } from 'styles/StyledToolTip';
import { RunStatusUI } from 'model/Status';

interface OwnProps {
  id?: string;
  status: RunStatusUI | null;
  dataTestId?: string;
}

type Props = OwnProps;

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  switch (status) {
    case RunStatusUI.SUCCESS:
      return (
        <StyledTooltip content={`Status for latest run: ${status}`}>
          <Badge
            className="cogs-badge badge-success"
            text={status}
            background="transparent"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    case RunStatusUI.FAILURE:
      return (
        <StyledTooltip content={`Status for latest run: ${status}`}>
          <Badge
            className="cogs-badge badge-fail"
            text={status}
            background="danger"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    case RunStatusUI.SEEN:
      return (
        <StyledTooltip content={`Status for latest run: ${status}`}>
          <Badge
            text={status}
            background="greyscale-grey2"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    case RunStatusUI.NOT_ACTIVATED:
      return (
        <StyledTooltip content="No runs yet">
          <i
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          >
            {status}
          </i>
        </StyledTooltip>
      );
    default:
      return <></>;
  }
};

export default StatusMarker;
