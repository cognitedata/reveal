import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Badge } from '@cognite/cogs.js';
import { StyledTooltip } from 'components/styled';
import { useTranslation } from 'common';
import { RunStatus } from 'model/Runs';

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
    case 'failure': {
      const tip = tooltipText ?? t('latest-run-err-message-not-set');
      return (
        <StyledTooltip content={tip}>
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
    }
    case 'seen':
      return (
        <StyledTooltip content={`${t('latest-run-status')}: ${status}`}>
          <Badge
            text={status}
            background="greyscale-grey2"
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
