import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Badge, Tooltip } from '@cognite/cogs.js';
import { Status } from '../../../model/Status';

interface OwnProps {
  id?: string;
  status: Status | null;
  dataTestId?: string;
}

type Props = OwnProps;

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  switch (status) {
    case Status.OK:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            className="cogs-badge badge-success"
            text={status}
            background="transparent"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </Tooltip>
      );
    case Status.FAIL:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            className="cogs-badge badge-fail"
            text={status}
            background="danger"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </Tooltip>
      );
    case Status.SEEN:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            text={status}
            background="greyscale-grey2"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </Tooltip>
      );
    case Status.NOT_ACTIVATED:
      return (
        <Tooltip content="No runs yet">
          <i
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          >
            {status}
          </i>
        </Tooltip>
      );
    default:
      return <></>;
  }
};

export default StatusMarker;
