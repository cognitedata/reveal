import React, { FunctionComponent, PropsWithoutRef } from 'react';
import {
  Body,
  Colors,
  Flex,
  Icon,
  IconType,
  Label,
  LabelVariants,
} from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { RunStatus } from 'model/Runs';
import { useRuns } from 'hooks/useRuns';
import RelativeTimeWithTooltip from './RelativeTimeWithTooltip';
import styled from 'styled-components';

interface OwnProps {
  id?: string;
  status?: RunStatus;
  dataTestId?: string;
}

type Props = OwnProps;

const getIconType = (status?: RunStatus): IconType => {
  switch (status) {
    case 'success':
      return 'Checkmark';
    case 'failure':
      return 'Error';
    case 'seen':
      return 'Info';
    default:
      return 'Remove';
  }
};

const getIconColor = (status?: RunStatus): string => {
  switch (status) {
    case 'success':
      return Colors['text-icon--status-success'];
    case 'failure':
      return Colors['text-icon--status-critical'];
    case 'seen':
    default:
      return Colors['text-icon--status-neutral'];
  }
};

const getVariant = (status?: RunStatus | 'not-activated'): LabelVariants => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failure':
      return 'danger';
    case 'seen':
      return 'default';
    case 'not-activated':
      return 'default';
    default:
      return 'unknown';
  }
};

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  const { t } = useTranslation();

  if (status == null) return <></>;

  const variant = getVariant(status);

  return (
    <Label
      size="medium"
      variant={variant}
      data-testid={`status-marker-${dataTestId}`}
      {...rest}
    >
      {t(status)}
    </Label>
  );
};

type LastRunStatusMarkerProps = { externalId: string };
export const LastRunStatusMarker: FunctionComponent<
  LastRunStatusMarkerProps
> = ({ externalId }: PropsWithoutRef<LastRunStatusMarkerProps>) => {
  const { t } = useTranslation();
  const { data, isFetched } = useRuns({
    limit: 1,
    externalId,
    statuses: ['success', 'failure'],
  });
  const lastRun = data?.pages?.[0]?.items?.[0];

  if (!isFetched) {
    return <></>;
  }

  if (lastRun) {
    const iconType = getIconType(lastRun.status);
    const iconColor = getIconColor(lastRun.status);
    return (
      <Flex gap={8} alignItems="center">
        <Icon type={iconType} style={{ color: iconColor }} />
        <RelativeTimeWithTooltip id="last-run" time={lastRun.createdTime} />
      </Flex>
    );
  }

  return <StyledBody level={2}>{t('not-activated')}</StyledBody>;
};

const StyledBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

export default StatusMarker;
