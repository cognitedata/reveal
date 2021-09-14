import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { RunStatusUI } from 'model/Status';

interface OwnProps {
  id?: string;
  status: RunStatusUI | null;
  dataTestId?: string;
}

type Props = OwnProps;

const getVariantAndText = (status: RunStatusUI): [LabelVariants, string] => {
  switch (status) {
    case RunStatusUI.SUCCESS:
      return ['success', 'Success'];
    case RunStatusUI.FAILURE:
      return ['danger', 'Failure'];
    case RunStatusUI.SEEN:
      return ['default', 'Seen'];
    case RunStatusUI.NOT_ACTIVATED:
      return ['unknown', 'Not activated'];
    default:
      return ['unknown', status];
  }
};

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  if (status == null) return <></>;
  const [variant, text] = getVariantAndText(status);
  return (
    <Label
      size={'medium'}
      variant={variant}
      data-testid={`status-marker-${dataTestId}`}
      {...rest}
    >
      {text}
    </Label>
  );
};

export default StatusMarker;
