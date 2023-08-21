import 'graphiql/graphiql.min.css';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { DataModelTypeDefs } from '@platypus/platypus-core';
import { useDataModelTypeDefs } from '@platypus-app/hooks/useDataModelActions';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { fetchGptAutoQuery } from '@platypus-app/utils/gpt-query';
import zIndex from '@platypus-app/utils/zIndex';

import {
  Button,
  Collapse,
  Flex,
  Icon,
  Infobox,
  Input,
  Modal,
  NotificationDot,
  Table,
  Tabs,
} from '@cognite/cogs.js';

import { RelationViewer } from '../../data-management/components/RelationViewer/RelationViewer';
import {
  getNodeId,
  getRelationLinkId,
} from '../../data-management/components/RelationViewer/utils';
import { GraphqlCodeEditor } from '../../data-model/components/GraphqlCodeEditor/GraphqlCodeEditor';
import { QueryExplorer } from '../components/QueryExplorer';
import graphqlQueryFetcher from '../utils/graphqlQueryFetcher';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
  space: string;
}

export const SearchPage = ({
  dataModelExternalId,
  space,
}: QueryExplorerPageProps) => {
  const { track } = useMixpanel();
  const [searchText, setSearchText] = useState('');
  const [isQueryExplorerVisible, setQueryExplorerVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [graphQLQuery, setGraphQLQuery] = useState<
    { query: string; variables?: any } | undefined
  >(undefined);
  const [queryExplorerQuery, setQueryExplorerQuery] = useState<
    { query: string; variables?: any } | undefined
  >(undefined);
  const [result, setResult] = useState<any>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const { version } = useParams() as { version: string };

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    version,
    space
  );

  useEffect(() => {
    setGraphQLQuery(undefined);
    setError(undefined);
  }, [searchText]);
  const onSearch = () => {
    setIsSearching(true);
    async function generateQuery() {
      const newQuery = await fetchGptAutoQuery(
        searchText,
        selectedDataModelVersion.externalId,
        selectedDataModelVersion.version,
        selectedDataModelVersion.space
      );
      // reset query explorer and result
      setQueryExplorerQuery(undefined);
      setResult(undefined);
      track('ChatGPTSearch.GeneratedQuery', {
        searchText,
        ...newQuery,
      });
      setGraphQLQuery(newQuery);
    }
    generateQuery();
  };

  useEffect(() => {
    if (graphQLQuery) {
      setIsSearching(true);
      setError(undefined);
      setResult(undefined);
      graphqlQueryFetcher
        .fetcher(
          graphQLQuery,
          dataModelExternalId,
          selectedDataModelVersion.version,
          space
        )
        .then((data) => {
          setIsSearching(false);
          track('ChatGPTSearch.RunQuery', { ...graphQLQuery });
          setResult(data);
        })
        .catch((e) => {
          track('ChatGPTSearch.Failed', {
            query: graphQLQuery,
            error: e?.message,
          });
          setIsSearching(false);
          setError(JSON.stringify(e, null, 2));
        });
    }
  }, [
    graphQLQuery,
    dataModelExternalId,
    selectedDataModelVersion.version,
    space,
    track,
  ]);

  const tableData = useMemo(
    () => (result ? (Object.values(result)[0] as any)['items'] : []),
    [result]
  );

  const primaryTypeDef = useMemo(
    () =>
      tableData && tableData.length > 0
        ? dataModelTypeDefs.types.find(
            (el) => el.name === tableData[0].__typename
          )
        : undefined,
    [dataModelTypeDefs, tableData]
  );

  const { nodes, edges } = useMemo(() => {
    const newNodes = new Map<
      string,
      { externalId: string; id: string; __typename: string; space: string }
    >();
    const newEdges = new Map<
      string,
      { id: string; source: string; type: string; target: string }
    >();
    recurseAndCreateNodesAndEdges(
      dataModelTypeDefs,
      tableData || [],
      newNodes,
      newEdges
    );
    return { nodes: [...newNodes.values()], edges: [...newEdges.values()] };
  }, [tableData, dataModelTypeDefs]);

  return (
    <Wrapper style={{ padding: 24, height: '100%' }} direction="column">
      <Flex style={{ position: 'relative' }}>
        <Input
          icon={isSearching ? 'Loader' : 'Search'}
          size="large"
          fullWidth
          value={searchText}
          disabled={isSearching}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (!e.shiftKey && e.keyCode === 13) {
              onSearch();
            }
          }}
          placeholder="Find what you are looking for..."
        />
        {graphQLQuery && (
          <div style={{ right: 16, position: 'absolute', top: 6 }}>
            <NotificationDot
              hidden={
                JSON.stringify(queryExplorerQuery) !==
                JSON.stringify(graphQLQuery)
              }
            >
              <Button
                icon={error ? 'Warning' : 'Code'}
                size="small"
                className={error ? 'graphql-error' : ''}
                onClick={() => {
                  setQueryExplorerVisible(!isQueryExplorerVisible);
                }}
              >
                Edit GraphQL
              </Button>
            </NotificationDot>
          </div>
        )}
      </Flex>
      {error && (
        <InfoPane direction="column" gap={6}>
          <Infobox type="danger">
            Something went wrong, try to edit the GraphQL query via the button
            on the right side of the search bar.
          </Infobox>
          <Collapse>
            <Collapse.Panel key="error" header="Show Error">
              <code>{error}</code>
            </Collapse.Panel>
          </Collapse>
        </InfoPane>
      )}

      {result && tableData.length === 0 && (
        <InfoPane>
          <p>No results.</p>
        </InfoPane>
      )}

      {result && tableData.length > 0 && !error && (
        <Tabs>
          <Tabs.Tab
            iconLeft="GraphTree"
            tabKey="Graph"
            label="Graph"
            name="Graph"
            disabled={nodes.length === 0}
          >
            <RelationViewer initialNodes={nodes} initialEdges={edges} />
          </Tabs.Tab>
          <Tabs.Tab
            iconLeft="DataTable"
            tabKey="Table"
            label="Table"
            name="Table"
          >
            <Flex direction="column" style={{ flex: 1 }}>
              <Table
                resizable
                columns={Object.keys(tableData[0])
                  .filter((column) => !column.startsWith('_'))
                  .map((key) => {
                    const field = primaryTypeDef?.fields.find(
                      (item) => item.name === key
                    );
                    return {
                      Header: (
                        <Flex alignItems="center" gap={6}>
                          <span>
                            {key}: {field?.type.name}
                          </span>
                          {field?.type.list && <Icon type="List" />}
                        </Flex>
                      ),
                      id: key,
                      accessor: (data) => {
                        if (field?.type.custom) {
                          if (field.type.list) {
                            if (data[key] && data[key].items.length > 0) {
                              return renderExpandable(
                                `${data[key].items[0].externalId}${
                                  data[key].items.length > 1 ? '...' : ''
                                }`
                              );
                            }
                            return '';
                          }
                          return renderExpandable(data[key]?.externalId);
                        }
                        if (field?.type.list) {
                          if (data[key] && data[key].length > 0) {
                            return renderExpandable(
                              `${data[key][0]}${
                                data[key].length > 1 ? '...' : ''
                              }`
                            );
                          }
                          return '';
                        }
                        return data[key] ? JSON.stringify(data[key]) : '';
                      },
                    };
                  })}
                dataSource={tableData}
              ></Table>
            </Flex>
          </Tabs.Tab>
          <Tabs.Tab iconLeft="Code" tabKey="JSON" label="JSON" name="JSON">
            <div style={{ height: '100' }}>
              <GraphqlCodeEditor
                disabled
                code={JSON.stringify(result, null, 2)}
                space="abc"
                language="json"
              />
            </div>
          </Tabs.Tab>
        </Tabs>
      )}
      {isQueryExplorerVisible && (
        <Modal
          title="Edit GraphQL"
          visible
          onCancel={() => {
            setQueryExplorerVisible(false);
            setGraphQLQuery(queryExplorerQuery);
          }}
          hideFooter
          size="full-screen"
        >
          <Flex style={{ height: '100%' }} direction="column">
            <p>
              For better result to be viewable in graph or table form, make sure{' '}
              <code>__typename</code> and <code>externalId</code> are included
              for every relationship or CDF resoure data type (TimeSeries).
            </p>
            <div style={{ position: 'relative', flex: 1 }}>
              <QueryExplorer
                space={space}
                dataModelExternalId={dataModelExternalId}
                schemaVersion={selectedDataModelVersion.version}
                defaultVariables={graphQLQuery?.variables}
                defaultQuery={graphQLQuery?.query}
                onQueryChange={(query) => {
                  setQueryExplorerQuery(query);
                  setGraphQLQuery(undefined);
                }}
              />
            </div>
          </Flex>
        </Modal>
      )}
    </Wrapper>
  );
};

const renderExpandable = (text: string) => {
  return (
    <Flex alignItems="center">
      <span style={{ flex: 1 }}>{text}</span>
      <Button size="small" icon="Expand" />
    </Flex>
  );
};
const recurseAndCreateNodesAndEdges = <
  T extends { externalId: string; __typename: string; space: string }
>(
  dataModelTypeDefs: DataModelTypeDefs,
  tableData: (T & any)[],
  nodes: Map<string, T>,
  edges: Map<
    string,
    { id: string; source: string; type: string; target: string }
  >
) => {
  tableData.forEach((el) => {
    if (!el.externalId) {
      return;
    }

    const id = getNodeId(el);

    nodes.set(id, { ...el, id });

    const currentType = dataModelTypeDefs.types.find(
      (type) => type.name === el.__typename
    );
    if (!currentType) {
      return;
    }
    const relationalFields =
      currentType?.fields
        .filter(
          (field) =>
            field.type.custom ||
            field.type.name === 'TimeSeries' ||
            field.type.name === 'Sequence' ||
            field.type.name === 'File'
        )
        .map((field) => ({ ...field.type, field: field.name })) || [];
    for (const field of relationalFields) {
      if (el[field.field]) {
        // relation list (if 1-1 make it a list, other wise take the items)
        const relations = field.list
          ? el[field.field].items || []
          : [el[field.field]];
        // add a link for each relation
        for (const relation of relations) {
          const relationNodeId = getNodeId(relation);
          const linkId = getRelationLinkId(
            `${currentType?.name}.${field.field}`,
            id,
            relationNodeId
          );
          edges.set(linkId, {
            id: linkId,
            source: id,
            target: relationNodeId,
            type: `${currentType?.name}.${field.field}`,
          });
        }
        // recurse on nested items
        recurseAndCreateNodesAndEdges(
          dataModelTypeDefs,
          relations,
          nodes,
          edges
        );
      }
    }
  });
};

const Wrapper = styled(Flex)`
  background: #fafafa;
  &&& .cogs-tabs {
    margin-top: 16px;
    flex: 1;
  }
  &&& .cogs-tabs__list {
    overflow-x: visible;
  }
  &&& .cogs.cogs-tabs .cogs-tabs__children > div {
    height: 100%;
    overflow: auto;
  }
  &&& .cogs.cogs-tabs .cogs-tabs__children {
    border: 1px solid #d9d9d9;
  }
  &&& .cogs-tabs__list__tab {
    background: rgba(50, 56, 83, 0.04);
    border-radius: 8px 8px 0px 0px;
  }
  &&& .cogs-tabs__list__tab[aria-selected='true'] {
    background: #ffffff;
    box-shadow: none;
    border-bottom: 1px solid white;
    margin-bottom: -1px;
    z-index: ${zIndex.TOOLBAR};
    border-width: 1px 1px 0px 1px;
    border-style: solid;
    border-color: #d9d9d9;
    border-radius: 8px 8px 0px 0px;
  }

  &&& .graphql-error svg {
    color: var(--cogs-text-icon--status-critical);
  }
`;

const InfoPane = styled(Flex)`
  background: #ffffff;
  margin-top: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px;
`;
