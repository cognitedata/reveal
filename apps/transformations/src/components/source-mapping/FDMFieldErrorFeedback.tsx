import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { useModel } from '@transformations/hooks/fdm';
import { TransformationRead } from '@transformations/types';

import { getTransformationMapping } from './utils';

export default function FDMFieldErrorFeedback({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();

  const mapping = getTransformationMapping(transformation.query);

  const [space, externalId, version] = mapping?.sourceLevel1?.split('.') || [];

  const { data, error } = useModel(externalId, space, version, {
    enabled:
      mapping?.sourceType === 'fdm' && !!space && !!externalId && !!version,
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
