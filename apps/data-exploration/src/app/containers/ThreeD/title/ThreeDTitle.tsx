import React, { useContext } from 'react';

import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Alert } from 'antd';

import {
  use3DModel,
  useRevision,
  useRevisionIndex,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import SecondaryModelDropdown from '@data-exploration-app/containers/ThreeD/title/SecondaryModelDropdown';

export const ThreeDTitle = ({
  id,
  image360SiteId,
}: {
  id?: number;
  image360SiteId?: string;
}): JSX.Element => {
  const {
    revisionId,
    secondaryModels,
    setSecondaryModels,
    images360,
    setImages360,
    viewer,
  } = useContext(ThreeDContext);

  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);

  const { data: revision, error: revisionError } = useRevision(id, revisionId, {
    enabled: isSuccess && !!revisionId,
  });

  const { data: revisionIndex } = useRevisionIndex(id, revisionId, {
    enabled: !!revisionId,
  });

  const goBackFallback = createLink('/explore/search/threeD');

  const error = modelError || revisionError;
  if (error && !image360SiteId) {
    return (
      <>
        <PageTitle title={id?.toString() ?? image360SiteId ?? 'No title'} />
        <SecondaryTopbar
          goBackFallback={goBackFallback}
          title={id?.toString() ?? image360SiteId ?? 'No title'}
        />
        <Alert type="error" message="Error" description={`${error}`} />
      </>
    );
  }

  return (
    <>
      <PageTitle title={image360SiteId ?? apiThreeDModel?.name ?? 'No title'} />
      <SecondaryTopbar
        goBackFallback={goBackFallback}
        title={
          image360SiteId ?? apiThreeDModel?.name ?? id?.toString() ?? 'No title'
        }
        subtitle={
          revisionId && revisionIndex && Number.isFinite(revisionIndex)
            ? `Revision ${revisionIndex}`
            : image360SiteId
            ? '360 Image'
            : undefined
        }
        dropdownProps={
          viewer && {
            content: (
              <SecondaryModelDropdown
                mainModel={apiThreeDModel}
                mainRevision={revision}
                mainImage360SiteId={image360SiteId}
                secondaryModels={secondaryModels}
                setSecondaryModels={setSecondaryModels}
                images360={images360}
                setImages360={setImages360}
                viewer={viewer}
              />
            ),
          }
        }
        extraContent={
          revision
            ? `Updated: ${revision.createdTime.toLocaleDateString()}`
            : undefined
        }
      />
    </>
  );
};
