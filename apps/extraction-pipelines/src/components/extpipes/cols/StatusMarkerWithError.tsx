import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Badge } from '@cognite/cogs.js';
import { StyledTooltip } from 'components/styled';
import { RunStatusUI } from 'model/Status';
import { useTranslation } from 'common';

interface OwnProps {
  id?: string;
  status: RunStatusUI;
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
    case RunStatusUI.SUCCESS:
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
    case RunStatusUI.FAILURE: {
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
    case RunStatusUI.SEEN:
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
    case RunStatusUI.NOT_ACTIVATED:
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
    default:
      return <></>;
  }
};

export default StatusMarkerWithError;
