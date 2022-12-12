import React, { useContext } from 'react';

import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Alert } from 'antd';

import {
  use3DModel,
  useRevision,
  useRevisionIndex,
} from 'app/containers/ThreeD/hooks';
import { ThreeDContext } from 'app/containers/ThreeD/ThreeDContext';
import SecondaryModelDropdown from 'app/containers/ThreeD/title/SecondaryModelDropdown';

export const ThreeDTitle = ({ id }: { id: number }): JSX.Element => {
  const { revisionId, secondaryModels, setSecondaryModels, viewer } =
    useContext(ThreeDContext);

  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);

  const { data: revision, error: revisionError } = useRevision(
    id,
    revisionId!,
    {
      enabled: isSuccess && !!revisionId,
    }
  );

  const { data: revisionIndex } = useRevisionIndex(id, revisionId!, {
    enabled: !!revisionId,
  });

  const goBackFallback = createLink('/explore/search/threeD');

  const error = modelError || revisionError;
  if (error) {
    return (
      <>
        <PageTitle title={id.toString()} />
        <SecondaryTopbar
          goBackFallback={goBackFallback}
          title={id.toString()}
        />
        <Alert type="error" message="Error" description={`${error}`} />
      </>
    );
  }

  return (
    <>
      <PageTitle title={apiThreeDModel?.name} />
      <SecondaryTopbar
        goBackFallback={goBackFallback}
        title={apiThreeDModel?.name || id.toString()}
        subtitle={
          revisionIndex && Number.isFinite(revisionIndex)
            ? `Revision ${revisionIndex}`
            : undefined
        }
        dropdownProps={
          apiThreeDModel &&
          revision &&
          viewer && {
            content: (
              <SecondaryModelDropdown
                mainModel={apiThreeDModel}
                mainRevision={revision}
                secondaryModels={secondaryModels}
                setSecondaryModels={setSecondaryModels}
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
