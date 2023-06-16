import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { useSchema } from '@transformations/hooks';
import { Destination, TransformationRead } from '@transformations/types';

import { getTransformationMapping } from './utils';

export default function CleanFieldErrorFeedback({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);

  const source = { type: mapping?.sourceLevel2 } as Destination;

  const { data, error } = useSchema(
    { destination: source!, action: 'abort' },
    {
      enabled: mapping?.sourceType === 'clean' && !!source,
    }
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
