import React from 'react';
import TopBar from 'components/TopBar';
import useListBlueprintsQuery from 'hooks/useQuery/useListBlueprintsQuery';
import { Button, Popconfirm } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import StatusMessage from 'components/StatusMessage';
import useDeleteBlueprintMutation from 'hooks/useMutation/useDeleteBlueprintMutation';
import useCreateBlueprintMutation from 'hooks/useMutation/useCreateBlueprintMutation';
import { useQueryClient } from 'react-query';
import { useFetchBlueprintDefinitionName } from 'hooks/useQuery/useFetchBlueprintDefinitionQuery';

import { BlueprintTable, PageWrapper } from './elements';

const HomePage: React.FC = () => {
  const { data: blueprints, isLoading } = useListBlueprintsQuery();
  const queryClient = useQueryClient();
  const history = useHistory();
  const deleteBlueprintMutation = useDeleteBlueprintMutation();
  const createBlueprintMutation = useCreateBlueprintMutation();

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
                  <Button unstyled onClick={(e) => e.stopPropagation()}>
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
          <h2>Your Blueprints</h2>
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
    </PageWrapper>
  );
};

export default HomePage;
