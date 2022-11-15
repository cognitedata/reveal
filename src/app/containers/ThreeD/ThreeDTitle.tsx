import React, { useMemo } from 'react';
import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Menu } from '@cognite/cogs.js';
import {
  use3DModel,
  useDefault3DModelRevision,
  useRevisionIndex,
} from './hooks';
import { useInfiniteQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { Model3D } from '@cognite/sdk/dist/src';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'antd';

const { Item } = Menu;

export default function ThreeDTitle({ id }: { id: number }) {
  const navigate = useNavigate();
  const sdk = useSDK();
  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);
  const { data: revision, error: revisionError } = useDefault3DModelRevision(
    id,
    {
      enabled: isSuccess,
    }
  );
  const { data: revisionIndex } = useRevisionIndex(id, revision?.id!, {
    enabled: !!revision?.id && isSuccess,
  });

  const goBackFallback = createLink('/explore/search/threeD');

  const { data } = useInfiniteQuery(
    ['3d', 'model-list'],
    ({ pageParam }) =>
      sdk
        .get<{ items: Model3D[]; nextCursor?: string }>(
          `/api/v1/projects/${sdk.project}/3d/models?${
            pageParam ? `cursor=${pageParam}` : ''
          }`
        )
        .then(r => r.data),
    {
      getNextPageParam: r => r.nextCursor,
      enabled: isSuccess,
    }
  );

  const models = useMemo(
    () =>
      data
        ? data.pages
            .reduce((accl, page) => [...accl, ...page.items], [] as Model3D[])
            .sort((a, b) =>
              a.name
                .toLocaleLowerCase()
                .localeCompare(b.name.toLocaleLowerCase())
            )
        : undefined,
    [data]
  );

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
            ? `Revision: ${revisionIndex + 1}`
            : undefined
        }
        dropdownProps={
          models && {
            content: (
              <Menu>
                {models.map(m => (
                  <Item
                    key={m.id}
                    onClick={() =>
                      navigate(createLink(`/explore/threeD/${m.id}`))
                    }
                  >
                    {m.name}
                  </Item>
                ))}
              </Menu>
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
}
