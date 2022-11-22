import React, { useContext } from 'react';

import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Alert } from 'antd';

import {
  use3DModel,
  useDefault3DModelRevision,
  useRevisionIndex,
} from 'app/containers/ThreeD/hooks';
import { ThreeDContext } from 'app/containers/ThreeD/ThreeDContext';
import SecondaryModelDropdown from 'app/containers/ThreeD/title/SecondaryModelDropdown';

export const ThreeDTitle = ({ id }: { id: number }): JSX.Element => {
  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);
  const { data: revision, error: revisionError } = useDefault3DModelRevision(
    id,
    {
      enabled: isSuccess,
    }
  );
  const { data: revisionIndex } = useRevisionIndex(id, revision?.id!, {
    enabled: !!revision?.id,
  });

  const { secondaryModels, setSecondaryModels, viewer } =
    useContext(ThreeDContext);

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
