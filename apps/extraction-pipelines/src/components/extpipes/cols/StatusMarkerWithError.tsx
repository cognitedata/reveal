import React, { FunctionComponent, PropsWithoutRef } from 'react';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../common';
import { RunStatus } from '../../../model/Runs';
import { StyledTooltip } from '../../styled';

interface OwnProps {
  id?: string;
  status?: RunStatus;
  tooltipText?: string;
  dataTestId?: string;
}

type Props = OwnProps;

const StatusMarkerWithError: FunctionComponent<Props> = ({
  status,
  tooltipText,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  const { t } = useTranslation();
  switch (status) {
    case 'success':
      return (
        <StyledTooltip content={`${t('latest-run-status')}: ${status}`}>
          <Chip
            label={status}
            size="x-small"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    case 'failure': {
      const tip = tooltipText ?? t('latest-run-err-message-not-set');
      return (
        <StyledTooltip content={tip}>
          <Chip
            label={status}
            size="x-small"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    }
    case 'seen':
      return (
        <StyledTooltip content={`${t('latest-run-status')}: ${status}`}>
          <Chip
            label={status}
            size="x-small"
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          />
        </StyledTooltip>
      );
    default:
      return (
        <StyledTooltip content={t('no-run-history')}>
          <i
            aria-label={`Status ${status}`}
            data-testid={`status-marker-${dataTestId}`}
            {...rest}
          >
            {status}
          </i>
        </StyledTooltip>
      );
  }
};

export default StatusMarkerWithError;
