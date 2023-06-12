import { useMemo } from 'react';

import {
  Body,
  Button,
  Flex,
  Icon,
  Illustrations,
  Table,
  toast,
} from '@cognite/cogs.js';

import { useDeleteModule } from '../../../hooks/useDeleteModule';
import { Module, useDeviceModules } from '../../../hooks/useDeviceModules';
import { useExtractorPipelines } from '../../../hooks/useExtractorPipelines';

export const ModulesTable = ({ id }: { id: string }) => {
  const { data = [], isLoading, isError } = useDeviceModules(id);
  const { data: pipelines = [] } = useExtractorPipelines();
  const { mutate: deleteModule } = useDeleteModule(id);

  const device = useMemo(
    () => data.find((el) => el.moduleId === '$edgeAgent'),
    [data]
  );

  const {
    properties: {
      desired: { modules: modulesData = {} },
    },
  } = device || { properties: { desired: { modules: {} } } };
  const modules = useMemo(
    () =>
      Object.entries(modulesData || {}).map(([key, value]) => ({
        externalId: key,
        ...(value as any),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modulesData, Object.keys(modulesData).length]
  );

  return (
    <Flex
      style={{ flex: 1, overflow: 'auto' }}
      alignItems="start"
      direction="column"
    >
      {isLoading && (
        <Flex alignItems="center" justifyContent="center" style={{ flex: 1 }}>
          <Icon type="Loader" />
        </Flex>
      )}
      {!isLoading && (
        <Table<Module & { externalId: string }>
          locale={{
            emptyText: isLoading ? (
              <Flex
                style={{ height: '100%', width: '100%' }}
                alignItems="center"
                justifyContent="center"
                gap={8}
                direction="column"
              >
                <Icon type="Loader" size={36} />
                Loading
              </Flex>
            ) : isError ? (
              <Flex
                style={{ height: '100%', width: '100%' }}
                alignItems="center"
                justifyContent="center"
                gap={8}
                direction="column"
              >
                <Illustrations.Solo type="EmptyStateSearchSad" />
                Unable to load data
              </Flex>
            ) : undefined,
          }}
          columns={[
            {
              Header: () => <Body level={2}>Name</Body>,
              id: 'name',
              accessor: 'externalId',
            },
            {
              Header: () => <Body level={2}>Type</Body>,
              id: 'type',
              accessor: 'type',
            },
            {
              Header: () => <Body level={2}>Is Deployed</Body>,
              id: 'deployed',
              accessor: 'externalId',
              Cell: () => {
                return <Icon type="Checkmark" />;
              },
            },
            {
              Header: () => <Body level={2}>Has Reported Data</Body>,
              id: 'modules',
              accessor: 'externalId',
              Cell: ({ cell }) => {
                return (device?.properties.reported.modules || {})[cell.value]
                  ?.lastStartTimeUtc ? (
                  <Icon type="Checkmark" />
                ) : (
                  <Icon type="CloseLarge" />
                );
              },
            },
            {
              Header: () => <Body level={2}>Status</Body>,
              id: 'active',
              accessor: 'status',
              Cell: ({ cell }) => {
                return cell?.value ? (
                  <Icon type="Checkmark" />
                ) : (
                  <Icon type="CloseLarge" />
                );
              },
            },
            {
              Header: () => <Body level={2}>Actions</Body>,
              id: 'actions',
              accessor: 'env',
              Cell: ({ cell }) => {
                const pipeline =
                  cell.value && cell.value['COGNITE_EXTRACTION_PIPELINE']
                    ? pipelines.find(
                        (el) =>
                          el.externalId ===
                          cell.value['COGNITE_EXTRACTION_PIPELINE'].value
                      )
                    : undefined;
                return (
                  <Flex direction="row-reverse">
                    <Button
                      icon="Delete"
                      onClick={async () => {
                        await deleteModule(cell.row.original.externalId);

                        toast.open('Successfully deleted new module', {
                          type: 'success',
                        });
                      }}
                      aria-label="delete module"
                      type="ghost-destructive"
                    />
                    {pipeline && (
                      <Button
                        type="secondary"
                        icon="ExternalLink"
                        iconPlacement="right"
                        onClick={() => {
                          const newUrl = window.location.href;
                          window.open(
                            newUrl.replaceAll(
                              `/iot/${id}`,
                              `/extpipes/extpipe/${
                                pipelines.find(
                                  (el) =>
                                    el.externalId ===
                                    cell.value['COGNITE_EXTRACTION_PIPELINE']
                                      .value
                                )!.id
                              }`
                            ),
                            '_blank'
                          );
                        }}
                      >
                        View Extractor
                      </Button>
                    )}
                  </Flex>
                );
              },
            },
          ]}
          dataSource={modules}
        />
      )}
    </Flex>
  );
};
