import React, { useContext } from 'react';

import { Alert } from 'antd';

import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';

import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/contexts/ThreeDContext';
import {
  use3DModel,
  useImage360,
  useRevision,
  useRevisionIndex,
} from '@data-exploration-app/containers/ThreeD/hooks';
import MainModelDropdown from '@data-exploration-app/containers/ThreeD/title/Dropdowns/MainModelDropdown';
import { useTranslation } from '@data-exploration-lib/core';

import { getMainModelTitle } from '../utils';

import { ThreeDTopbar } from './ThreeDTopbar';

export const ThreeDTitle = ({
  id,
  image360SiteId,
}: {
  id?: number;
  image360SiteId?: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const { revisionId } = useContext(ThreeDContext);

  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);

  const image360SiteData = useImage360(image360SiteId);

  const { data: revision, error: revisionError } = useRevision(id, revisionId, {
    enabled: isSuccess && !!revisionId,
  });

  const { data: revisionIndex } = useRevisionIndex(id, revisionId, {
    enabled: !!revisionId,
  });

  const goBackFallback = createLink('/explore/search/threeD');

  const error = modelError ?? revisionError;

  if (error && !image360SiteId) {
    return (
      <>
        <PageTitle title={id?.toString() ?? image360SiteId ?? 'No id'} />
        <SecondaryTopbar
          goBackFallback={goBackFallback}
          title={id?.toString() ?? image360SiteId ?? 'No id'}
        />
        <Alert type="error" message="Error" description={`${error}`} />
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={getMainModelTitle(t, apiThreeDModel, image360SiteData)}
      />
      <SecondaryTopbar
        goBackFallback={goBackFallback}
        title={getMainModelTitle(t, apiThreeDModel, image360SiteData)}
        subtitle={
          revisionId && revisionIndex && Number.isFinite(revisionIndex)
            ? t('REVISION_WITH_INDEX', `Revision ${revisionIndex}`, {
                index: revisionIndex,
              })
            : image360SiteId
            ? t('360_IMAGE', '360 Image', { count: 1 })
            : undefined
        }
        dropdownProps={{
          content: (
            <MainModelDropdown
              model={apiThreeDModel}
              revision={revision}
              image360SiteData={image360SiteData}
            />
          ),
        }}
        extraContent={
          <ThreeDTopbar
            model={apiThreeDModel}
            mainRevision={revision}
            mainImage360Data={image360SiteData}
          />
        }
      />
    </>
  );
};
