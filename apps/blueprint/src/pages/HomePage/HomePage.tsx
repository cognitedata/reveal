import React, { useContext, useState } from 'react';
import TopBar from 'components/TopBar';
import useListBlueprintsQuery from 'hooks/useQuery/useListBlueprintsQuery';
import {
  Button,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Select,
} from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import StatusMessage from 'components/StatusMessage';
import useDeleteBlueprintMutation from 'hooks/useMutation/useDeleteBlueprintMutation';
import useCreateBlueprintMutation from 'hooks/useMutation/useCreateBlueprintMutation';
import { useQueryClient } from 'react-query';
import { useFetchBlueprintDefinitionName } from 'hooks/useQuery/useFetchBlueprintDefinitionQuery';
import { AuthContext } from 'providers/AuthProvider';
import {
  AccessRight,
  AccessRightType,
  AccessType,
  BlueprintReference,
} from 'typings';
import useUpdateAccessMutation from 'hooks/useMutation/useUpdateAccessMutation';

import { BlueprintTable, PageWrapper } from '../elements';

const HomePage: React.FC = () => {
  const { blueprintService } = useContext(AuthContext);
  const { data: blueprints, isLoading } = useListBlueprintsQuery();
  const [processBlueprintSharing, setProcessingBlueprintSharing] =
    useState<BlueprintReference | null>(null);
  const queryClient = useQueryClient();
  const history = useHistory();
  const deleteBlueprintMutation = useDeleteBlueprintMutation();
  const createBlueprintMutation = useCreateBlueprintMutation();
  const updateAccessMutation = useUpdateAccessMutation({
    onSuccess: () => {
      setProcessingBlueprintSharing(null);
    },
  });

  const [newAccessRight, setNewAccessRight] = useState<AccessRight>({
    email: '',
    access: 'READ',
  });

  const onNewBlueprint = async () => {
    if (createBlueprintMutation.isLoading) return;
    const newBlueprint = await createBlueprintMutation.mutateAsync();
    history.push(`/blueprint/${newBlueprint?.externalId}`);
  };

  const onDelete = async (id: string) => {
    deleteBlueprintMutation.mutate(id);
  };

  const renderBlueprints = () => {
    if (isLoading) {
      return (
        <StatusMessage
          type="Loading"
          message="One moment while we fetch your blueprints..."
        />
      );
    }

    if (blueprints && blueprints.length === 0) {
      return (
        <StatusMessage
          type="Missing.Blueprints"
          message="You have no blueprints yet! Click the 'New Blueprint' button to start."
        />
      );
    }

    return (
      <BlueprintTable>
        <thead>
          <tr>
            <th aria-label="name" />
            <th>Owned by</th>
            <th>Last opened</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {blueprints
            ?.sort((a, b) => b.lastOpened - a.lastOpened)
            .map((blueprint) => (
              <tr
                key={blueprint.externalId}
                className="blueprint-row"
                onClick={() => {
                  queryClient.invalidateQueries([
                    useFetchBlueprintDefinitionName,
                    blueprint.externalId,
                  ]);
                  history.push(`/blueprint/${blueprint.externalId}`);
                }}
              >
                <td>{blueprint.name}</td>

                <td>{blueprint.createdBy?.email}</td>

                <td>{dayjs(blueprint.lastOpened).format('LLL')}</td>
                <td>
                  {blueprintService?.getAccessRights(blueprint) === 'WRITE' && (
                    <Button unstyled onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="ghost"
                        icon="Share"
                        onClick={() => setProcessingBlueprintSharing(blueprint)}
                      />
                      <Popconfirm
                        content={
                          <span>
                            Are you sure you want to delete this blueprint?
                            <br /> This is <strong>IRREVERSABLE</strong>.
                          </span>
                        }
                        onConfirm={() => {
                          onDelete(blueprint.externalId);
                        }}
                      >
                        <Button type="ghost-danger" icon="Delete" />
                      </Popconfirm>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </BlueprintTable>
    );
  };

  return (
    <PageWrapper>
      <TopBar />
      <header>
        <main>
          <h2>All Blueprints</h2>
          <Button
            icon={createBlueprintMutation.isLoading ? 'Loader' : 'Add'}
            disabled={createBlueprintMutation.isLoading}
            type="primary"
            onClick={onNewBlueprint}
          >
            New Blueprint
          </Button>
        </main>
      </header>
      <main>{renderBlueprints()}</main>
      <Modal
        visible={processBlueprintSharing !== null}
        onCancel={() => setProcessingBlueprintSharing(null)}
        onOk={() => {
          if (processBlueprintSharing) {
            updateAccessMutation.mutate(processBlueprintSharing);
          }
        }}
        width={560}
        title="Share this blueprint"
      >
        {updateAccessMutation.isLoading ? (
          'Loading...'
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <h3>Visibility</h3>
              <Select<AccessType>
                style={{ width: '100%' }}
                value={{
                  label: processBlueprintSharing?.accessType || 'PRIVATE',
                  value: processBlueprintSharing?.accessType || 'PRIVATE',
                }}
                options={[
                  { label: 'Public access - visible to all', value: 'PUBLIC' },
                  {
                    label: 'Protected access - anyone with link can access',
                    value: 'PROTECTED',
                  },
                  {
                    label: 'Private access - only visible to those with access',
                    value: 'PRIVATE',
                  },
                ]}
                onChange={(nextValue: { value: AccessType }) => {
                  if (processBlueprintSharing) {
                    setProcessingBlueprintSharing({
                      ...processBlueprintSharing,
                      accessType: nextValue.value,
                    });
                  }
                }}
              />
            </div>
            <div>
              <h3>Shared with</h3>
              {(processBlueprintSharing?.accessRights || []).map(
                (accessRight) => (
                  <Flex
                    key={accessRight.email}
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ padding: 8 }}
                  >
                    <div>
                      {accessRight.email}
                      <Button
                        icon="Delete"
                        type="ghost"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          if (processBlueprintSharing) {
                            setProcessingBlueprintSharing({
                              ...processBlueprintSharing,
                              accessRights:
                                processBlueprintSharing?.accessRights?.filter(
                                  (x) => x.email !== accessRight.email
                                ),
                            });
                          }
                        }}
                      />
                    </div>

                    <Select<AccessRightType>
                      width={120}
                      theme="grey"
                      value={{
                        label: accessRight?.access || 'READ',
                        value: accessRight?.access || 'READ',
                      }}
                      options={[
                        { label: 'Read only', value: 'READ' },
                        { label: 'Read and Write', value: 'WRITE' },
                      ]}
                      onChange={(nextValue: { value: AccessRightType }) => {
                        if (processBlueprintSharing) {
                          const nextAccessRights = [
                            ...(processBlueprintSharing?.accessRights || []),
                          ].map((x) =>
                            x.email === accessRight.email
                              ? { ...x, access: nextValue.value }
                              : x
                          );
                          setProcessingBlueprintSharing({
                            ...processBlueprintSharing,
                            accessRights: nextAccessRights,
                          });
                        }
                      }}
                    />
                  </Flex>
                )
              )}
              <Flex
                gap={8}
                style={{
                  marginTop: 16,
                  background: 'var(--cogs-greyscale-grey2)',
                  padding: 8,
                }}
              >
                <Input
                  style={{ width: '100%' }}
                  value={newAccessRight.email}
                  placeholder="Enter email"
                  onChange={(e) =>
                    setNewAccessRight({
                      ...newAccessRight,
                      email: e.target.value,
                    })
                  }
                />
                <Select<AccessRightType>
                  width={120}
                  theme="grey"
                  value={{
                    label: newAccessRight?.access || 'READ',
                    value: newAccessRight?.access || 'READ',
                  }}
                  options={[
                    { label: 'Read only', value: 'READ' },
                    { label: 'Read and Write', value: 'WRITE' },
                  ]}
                  onChange={(nextValue: { value: AccessRightType }) =>
                    setNewAccessRight({
                      ...newAccessRight,
                      access: nextValue.value,
                    })
                  }
                />
              </Flex>
              <br />
              <Flex justifyContent="flex-end">
                <Button
                  type="primary"
                  onClick={() => {
                    if (processBlueprintSharing) {
                      if (
                        processBlueprintSharing.accessRights?.some(
                          (right) => right.email === newAccessRight.email
                        )
                      ) {
                        return;
                      }
                      setProcessingBlueprintSharing({
                        ...processBlueprintSharing,
                        accessRights: [
                          ...(processBlueprintSharing.accessRights || []),
                          newAccessRight,
                        ],
                      });
                      setNewAccessRight({
                        email: '',
                        access: 'READ',
                      });
                    }
                  }}
                >
                  Add permission
                </Button>
              </Flex>
            </div>
          </>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default HomePage;
