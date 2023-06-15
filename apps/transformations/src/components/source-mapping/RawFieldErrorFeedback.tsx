import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { useQuickProfile } from '@transformations/hooks/profiling-service';
import { TransformationRead } from '@transformations/types';

import { getTransformationMapping } from './utils';

export default function DestinationErrorFeedback({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);
  const database = mapping?.sourceLevel1;
  const table = mapping?.sourceLevel2;

  const { data, error } = useQuickProfile(
    {
      database: database!,
      table: table!,
    },
    { enabled: mapping?.sourceType === 'raw' && !!database && !!table }
  );

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
