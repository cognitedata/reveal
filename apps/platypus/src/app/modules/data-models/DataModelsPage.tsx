import { lazy, Suspense } from 'react';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { ReleaseBanner } from '@platypus-app/components/ReleaseBanner/ReleaseBanner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useBetaDataModels } from './hooks/useBetaDataModels';
import { isFDMv3 } from '@platypus-app/flags';
import { createLink } from '@cognite/cdf-utilities';

const DataModelsList = lazy(() =>
  import('./pages/DataModelsList').then((module) => ({
    default: module.DataModelsList,
  }))
);

export const Banner = () => {
  const { t } = useTranslation('ReleaseBanner');

  const { data: dmsv2DataModels } = useBetaDataModels();
  const isFDMV3 = isFDMv3();

  return (
    <>
      {dmsv2DataModels && dmsv2DataModels.length > 0 && isFDMV3 && (
        <ReleaseBanner
          defaultIsOpen
          linkUrl={createLink('/data-models-previous')}
          text={t(
            'release-banner-text-use-previous-data-models',
            'To work with data models you created with the previous beta, click '
          )}
          buttonText={t(
            'release-banner-button-view-previous-data-models',
            'View previous data models'
          )}
        />
      )}
      {!isFDMV3 && (
        <ReleaseBanner
          defaultIsOpen
          linkUrl={createLink('/data-models')}
          text={t(
            'release-banner-text-use-latest-data-models',
            'These data models were created with a previous beta version and will soon be deprecated. To work with the latest version, click'
          )}
          buttonText={t(
            'release-banner-button-view-latest-data-models',
            'View data modeling'
          )}
        />
      )}
    </>
  );
};

export const DataModelsPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Banner />
      <DataModelsList />
    </Suspense>
  );
};
