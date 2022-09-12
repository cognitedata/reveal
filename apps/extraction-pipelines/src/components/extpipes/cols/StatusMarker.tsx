import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { RunStatus } from 'model/Runs';
import { useRuns } from 'hooks/useRuns';

interface OwnProps {
  id?: string;
  status?: RunStatus;
  dataTestId?: string;
}

type Props = OwnProps;

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
  if (lastRun) {
    const variant = getVariant(lastRun.status);
    return (
      <Label
        size="medium"
        variant={variant}
        data-testid={`status-marker-${externalId}`}
      >
        {t(lastRun.status)}
      </Label>
    );
  } else if (isFetched) {
    return (
      <Label
        size="medium"
        variant="unknown"
        data-testid={`status-marker-${externalId}`}
      >
        {t('not-activated')}
      </Label>
    );
  }
  return null;
};

export default StatusMarker;
