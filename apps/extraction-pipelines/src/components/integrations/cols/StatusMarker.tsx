import React, { FunctionComponent } from 'react';
import { Badge, Tooltip } from '@cognite/cogs.js';
import { Status } from '../../../model/Status';
import { badge } from '../../../cogs-variables';

interface OwnProps {
  status: Status;
  dataTestId?: string;
}

type Props = OwnProps;

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
}: Props) => {
  switch (status) {
    case Status.OK:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            text={status}
            size={badge.size}
            background="success"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
          />
        </Tooltip>
      );
    case Status.FAIL:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            text={status}
            size={badge.size}
            background="danger"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
          />
        </Tooltip>
      );
    case Status.SEEN:
      return (
        <Tooltip content={`Status for latest run: ${status}`}>
          <Badge
            text={status}
            size={badge.size}
            background="greyscale-grey2"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
          />
        </Tooltip>
      );
    case Status.NOT_ACTIVATED:
      return (
        <Tooltip content="No runs yet">
          <Badge
            text={status}
            size={badge.size}
            background="greyscale-grey4"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
          />
        </Tooltip>
      );
    default:
      return <></>;
  }
};
StatusMarker.defaultProps = {
  dataTestId: '',
};

export default StatusMarker;
