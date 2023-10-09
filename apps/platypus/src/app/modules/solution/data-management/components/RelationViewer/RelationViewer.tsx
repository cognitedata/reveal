import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { DataModelTypeDefsField } from '@platypus/platypus-core';
import { SimulationLinkDatum } from 'd3';
import uniqolor from 'uniqolor';

import { Chip, Menu } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';
import {
  Graph,
  getLinkId,
  Node,
} from '../../../../../components/Graph/GraphEngine';
import { Spinner } from '../../../../../components/Spinner/Spinner';
import { useDataModelTypeDefs } from '../../../../../hooks/useDataModelActions';
import { useMixpanel } from '../../../../../hooks/useMixpanel';
import { useSelectedDataModelVersion } from '../../../../../hooks/useSelectedDataModelVersion';
import { CustomDataTypes } from '../DataPreviewTable/collapsible-panel-container';

import { RelationNode } from './RelationNode';
import { getNodeId, getRelationLinkId, getRelationshipsForData } from './utils';

const getColor = (key: string) => uniqolor(key);

export const RelationViewer = <
  T extends {
    externalId: string;
    id: string;
    __typename: string;
    space: string;
  }
>({
  initialNodes,
  initialEdges,
}: {
  initialNodes: T[];
  initialEdges: {
    id: string;
    source: string;
    target: string;
    type: string;
  }[];
}) => {
  const { track } = useMixpanel();
  const [isLoading, setLoading] = useState(true);
  const [nodes, setNodes] = useState(
    new Map<string, T & { id: string; isSelected?: boolean }>()
  );
  const [links, setLinks] = useState(new Map());
  const [_, setSelectedItem] = useState<Map<string, string[]>>(new Map());
  const [selectedFields, setSelectedField] = useState<{
    [key in string]: {
      def: DataModelTypeDefsField;
      isToggled: boolean;
    }[];
  }>({});

  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    version,
    space
  );
  const onClick = useCallback(
    (node: T & { __typename: string; id: string; x?: number; y?: number }) => {
      setSelectedItem((currentSelectedSet) => {
        const newSelectedItems = new Map(currentSelectedSet);
        // try and delete, if return a list of ids, it means it existed
        const externalIdsToDelete = newSelectedItems.get(node.id);

        // at least 1 item needs to be selected
        if (newSelectedItems.size === 1 && externalIdsToDelete) {
          return newSelectedItems;
        }
        // first click for a new item, fetch and add nodes and edges
        if (!externalIdsToDelete) {
          const clickedTypeName = node.__typename;
          if (clickedTypeName) {
            getRelationshipsForData({
              dataModelTypeDefs,
              externalId: node.externalId,
              space: space,
              instanceSpace: node.space,
              dataModelExternalId,
              version: selectedDataModelVersion.version,
              typeName: clickedTypeName,
            }).then((item) => {
              const itemType = dataModelTypeDefs.types.find(
                (el) => el.name === clickedTypeName
              );
              const fields =
                itemType?.fields.filter(
                  (el) =>
                    el.type.custom ||
                    el.type.name === 'TimeSeries' ||
                    el.type.name === 'Sequence' ||
                    el.type.name === 'File'
                ) || [];
              const newNodes = new Map<
                string,
                T & { id: string; isSelected?: boolean }
              >();
              const newLinks = new Map();
              for (const field of fields) {
                let items: any[] = [];
                if (field.type.list) {
                  if (CustomDataTypes.includes(field.type.name)) {
                    items = item[field.name] || [];
                  } else {
                    items = (item[field.name] || { items: [] }).items;
                  }
                } else {
                  items = [item[field.name]];
                }
                items.forEach((el: T) => {
                  if (!el) {
                    return;
                  }
                  const id = getNodeId(el);
                  newNodes.set(id, {
                    ...el,
                    id,
                    initialX: node.x,
                    initialY: node.y,
                  });
                  const linkId = getRelationLinkId(
                    `${itemType?.name}.${field.name}`,
                    node.id,
                    id
                  );
                  newLinks.set(linkId, {
                    id: linkId,
                    source: node.id,
                    target: id,
                    type: `${clickedTypeName}.${field.name}`,
                  });
                });
              }
              // update selected items with the new edges
              newSelectedItems.set(getNodeId(node), [...newLinks.keys()]);

              const types = new Set(
                [...newNodes.values()].map((it) => it.__typename)
              );

              // update the sidebar menu
              setSelectedField((currValue) => {
                // update the nodes and edges
                setNodes((currNodes) => {
                  currNodes.set(node.id, {
                    ...node,
                    isSelected: true,
                  });
                  setLinks((currLinks) => new Map([...newLinks, ...currLinks]));
                  return new Map([...newNodes, ...currNodes]);
                });
                return [clickedTypeName, ...types.values()].reduce(
                  (prev, type) => {
                    if (!prev[type] || prev[type].length === 0) {
                      if (type === clickedTypeName) {
                        return {
                          ...prev,
                          [type]: fields.map((field) => ({
                            def: field,
                            isToggled: true,
                          })),
                        };
                      }
                      return { ...prev, [type]: [] };
                    }
                    return prev;
                  },
                  currValue
                );
              });
            });
          }
        } else {
          // unchecking - remove links and nodes linked to id
          // update selected items
          newSelectedItems.delete(node.id);

          // update nodes and edges
          setLinks((currLinks) => {
            const newLinksList = new Map(currLinks);
            for (const link of externalIdsToDelete) {
              newLinksList.delete(link);
            }
            setNodes((currNodes) => {
              const nodesToDelete = new Set(currNodes.keys());
              for (const link of newLinksList.values()) {
                nodesToDelete.delete(link.source);
                nodesToDelete.delete(link.target);
              }
              const newNodesList = new Map(currNodes);
              newNodesList.set(node.id, { ...node, isSelected: false });
              for (const key of nodesToDelete) {
                newNodesList.delete(key);
              }

              const types = new Set(
                [...newNodesList.values()].map((it) => it.__typename)
              );

              // update the sidebar menu
              setSelectedField((currSelectedFields) => {
                return [...types].reduce((prev, curr) => {
                  return {
                    ...prev,
                    [curr]: currSelectedFields[curr],
                  };
                }, {} as typeof currSelectedFields);
              });
              return newNodesList;
            });

            return newLinksList;
          });
        }
        return newSelectedItems;
      });
    },
    [
      dataModelExternalId,
      dataModelTypeDefs,
      selectedDataModelVersion.version,
      space,
    ]
  );

  useEffect(() => {
    // make sure it loads at first
    if (
      initialEdges.length === 0 &&
      initialNodes.length === 1 &&
      nodes.size === 1
    ) {
      const node = [...nodes.values()][0];
      if (node && !node.isSelected) {
        onClick({
          ...node,
          fx: 0,
          fy: 0,
        });
      }
    }
  }, [initialEdges, nodes, onClick, initialNodes]);

  useEffect(() => {
    setNodes(
      new Map(
        initialNodes.map((el, i) => {
          if (i === 0) {
            return [el.id, { fx: 0, fy: 0, ...el }];
          }
          return [el.id, { ...el }];
        })
      )
    );
    setLinks(new Map(initialEdges.map((el) => [el.id, el])));
  }, [initialEdges, initialNodes]);

  const renderNode = useCallback(
    (node: T & { isSelected?: boolean; id: string }) => (
      <RelationNode
        key={node.id}
        node={node}
        onClick={(n) => {
          onClick(n);

          track('Graph.Expand', {
            node: getNodeId(n),
          });
        }}
        isSelected={node.isSelected}
      />
    ),
    [onClick, track]
  );
  const renderLink = useCallback(
    (el: SimulationLinkDatum<Node & T> & { type?: string }) => {
      const id = getLinkId(el);
      return (
        <g key={`${id}`} className="path">
          <text>
            <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
              {el.type}
            </textPath>
          </text>
          <path key={id} id={id} />
        </g>
      );
    },
    []
  );

  const disabledFields = useMemo(() => {
    const list: { type: string; field: string }[] = [];
    Object.entries(selectedFields).forEach(([key, fields]) => {
      fields.forEach((field) => {
        if (!field.isToggled) {
          list.push({ type: key, field: field.def.name });
        }
      });
    });
    return list;
  }, [selectedFields]);

  // Represents a filtered list of visible links
  const visibleLinks = useMemo(() => {
    const keys = [...nodes.values()]
      .filter((el) => el.isSelected)
      .map((el) => el.externalId);

    // Return a new array containing filtered links from the `links` Map based on the following conditions:
    // 1. If `disabledFields` is empty, include all links
    // 2. If both the source and target of the link are in the `keys` array, include the link
    // 3. If none of the `disabledFields` match the link's source field and source type, include the link
    return [...links.values()].filter((link) =>
      disabledFields.length === 0
        ? true
        : (keys.includes(link.source) && keys.includes(link.target)) ||
          !disabledFields.some(
            (field) => link.type === `${field.type}.${field.field}`
          )
    );
  }, [links, disabledFields, nodes]);

  // Represents a filtered list of visible nodes
  const visibleNodes = useMemo(() => {
    return [...nodes.values()]
      .filter(
        (node) =>
          // include nodes that are selected
          node.isSelected ||
          // include nodes that are in the 'initialNodes' array
          initialNodes.some(
            (initialNode) => getNodeId(initialNode) === node.id
          ) ||
          // include nodes that are connected to other visible nodes
          (disabledFields.length === 0
            ? true
            : visibleLinks.some(
                (link) =>
                  link.source === getNodeId(node) ||
                  link.target === getNodeId(node)
              ))
      )
      .map((el) => ({
        ...el,
        title: el.externalId,
      }));
  }, [nodes, disabledFields.length, initialNodes, visibleLinks]);

  return (
    <SDKProvider sdk={getCogniteSDKClient()}>
      <Graph<T>
        nodes={visibleNodes}
        links={visibleLinks}
        useCache={false}
        renderNode={renderNode}
        renderLink={renderLink}
        onLoadingStatus={setLoading}
        style={{
          position: 'relative',
          backgroundImage: `radial-gradient(
          var(--cogs-border-default) 1px,
          transparent 1px
        )`,
          backgroundSize: '24px 24px',
          backgroundColor: 'var(--cogs-bg-canvas)',
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--cogs-bg-canvas)',
            }}
          >
            <Spinner />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 12,
          }}
        >
          {Object.entries(selectedFields).map(([key, fields]) => (
            <div key={key}>
              <div style={{ marginTop: 12 }} key={`${key}-chip`}>
                <Chip
                  hideTooltip
                  size="small"
                  key={key}
                  style={{ background: getColor(key).color }}
                  prominence={getColor(key).isLight ? 'muted' : 'strong'}
                  label={key}
                />
              </div>
              {fields && fields.length > 0 && (
                <Menu key={`${key}-menu`}>
                  {fields.map((field) => (
                    <Menu.Item
                      key={field.def.name}
                      hasCheckbox
                      checkboxProps={{
                        checked: field.isToggled,
                        onChange: (e: { stopPropagation: () => void }) => {
                          e.stopPropagation();
                          setSelectedField({
                            ...selectedFields,
                            [key]: selectedFields[key].map((item) => {
                              if (item.def.name === field.def.name) {
                                track('Graph.Filter', {
                                  item,
                                  isToggled: !field.isToggled,
                                });
                                return { ...item, isToggled: !field.isToggled };
                              }
                              return item;
                            }),
                          });
                        },
                      }}
                    >
                      {field.def.name}: {field.def.type.name}
                      {field.def.type.list ? '[]' : ''}
                    </Menu.Item>
                  ))}
                </Menu>
              )}
            </div>
          ))}
        </div>
      </Graph>
    </SDKProvider>
  );
};
