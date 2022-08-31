import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { RunStatusUI } from 'model/Status';
import { TranslationKeys, useTranslation } from 'common';

interface OwnProps {
  id?: string;
  status: RunStatusUI | null;
  dataTestId?: string;
}

type Props = OwnProps;

const getVariantAndText = (
  status: RunStatusUI,
  _t: (key: TranslationKeys) => string
): { variant: LabelVariants; text: string } => {
  switch (status) {
    case RunStatusUI.SUCCESS:
      return { variant: 'success', text: _t('success') };
    case RunStatusUI.FAILURE:
      return { variant: 'danger', text: _t('failure') };
    case RunStatusUI.SEEN:
      return { variant: 'default', text: _t('seen') };
    case RunStatusUI.NOT_ACTIVATED:
      return { variant: 'unknown', text: _t('not-activated') };
    default:
      return { variant: 'unknown', text: status };
  }
};

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  const { t } = useTranslation();

  if (status == null) return <></>;

  const variantAndText = getVariantAndText(status, t);

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
