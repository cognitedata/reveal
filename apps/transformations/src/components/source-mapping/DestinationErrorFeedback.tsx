import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { useSchema } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';

export default function DestinationErrorFeedback({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();

  const { data, error } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  if (error && !data) {
    const msg = error.errorMessage ?? error.message?.toString();

    return (
      <InfoBox status="critical">
        <p>{t('details-mapping-source-schema-error')}</p>
        {!!msg && <p>{msg}</p>}
      </InfoBox>
    );
  }

  return null;
}
