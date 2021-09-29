import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { RunStatusUI } from 'model/Status';

interface OwnProps {
  id?: string;
  status: RunStatusUI | null;
  dataTestId?: string;
}

type Props = OwnProps;

const getVariantAndText = (
  status: RunStatusUI
): { variant: LabelVariants; text: string } => {
  switch (status) {
    case RunStatusUI.SUCCESS:
      return { variant: 'success', text: 'Success' };
    case RunStatusUI.FAILURE:
      return { variant: 'danger', text: 'Failure' };
    case RunStatusUI.SEEN:
      return { variant: 'default', text: 'Seen' };
    case RunStatusUI.NOT_ACTIVATED:
      return { variant: 'unknown', text: 'Not activated' };
    default:
      return { variant: 'unknown', text: status };
  }
};

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  if (status == null) return <></>;
  const variantAndText = getVariantAndText(status);
  return (
    <Label
      size="medium"
      variant={variantAndText.variant}
      data-testid={`status-marker-${dataTestId}`}
      {...rest}
    >
      {variantAndText.text}
    </Label>
  );
};

export default StatusMarker;
