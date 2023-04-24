import { Body, Chip, Colors, Flex, Icon, Menu } from '@cognite/cogs.js';
import {
  Graph,
  getLinkId,
  Node,
} from '@platypus-app/components/Graph/GraphEngine';
import { useDataModelTypeDefs } from '@platypus-app/hooks/useDataModelActions';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { DataModelTypeDefsField } from '@platypus/platypus-core';
import { SimulationLinkDatum } from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import uniqolor from 'uniqolor';
import { getRelationshipsForData } from './utils';

const getColor = (key: string) => uniqolor(key);

export const RelationViewer = <
  T extends { externalId: string; __typename: string }
>({
  typeName,
  initialNodes,
  initialEdges,
}: {
  typeName: string;
  initialNodes: T[];
  initialEdges: {
    id: string;
    source: string;
    target: string;
    sourceField?: string;
    sourceType?: string;
  }[];
}) => {
  const { track } = useMixpanel();
  const [nodes, setNodes] = useState(
    new Map(initialNodes.map((el) => [el.externalId, el]))
  );
  const [links, setLinks] = useState(
    new Map(initialEdges.map((el) => [el.id, el]))
  );
  const [selectedItems, setSelectedItem] = useState<Map<string, string[]>>(
    new Map()
  );
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

  const dataModelType = useMemo(
    () => dataModelTypeDefs.types.find((el) => el.name === typeName),
    [dataModelTypeDefs, typeName]
  );

  const onClick = useCallback(
    (node: T & { __typename?: string }) => {
      setSelectedItem((currentSelectedSet) => {
        const newSelectedItems = new Map(currentSelectedSet);
        // try and delete, if return a list of ids, it means it existed
        const externalIdsToDelete = newSelectedItems.get(node.externalId);

        // at least 1 item needs to be selected
        if (newSelectedItems.size === 1 && externalIdsToDelete) {
          return newSelectedItems;
        }
        // first click for a new item, fetch and add nodes and edges
        if (!externalIdsToDelete) {
          const clickedTypeName = node.__typename || dataModelType?.name;
          if (clickedTypeName) {
            getRelationshipsForData({
              dataModelTypeDefs,
              externalId: node.externalId,
              space,
              dataModelExternalId,
              version: selectedDataModelVersion.version,
              typeName: clickedTypeName,
            }).then((item) => {
              const fields =
                dataModelTypeDefs.types
                  .find((el) => el.name === clickedTypeName)
                  ?.fields.filter((el) => el.type.custom) || [];
              const newNodes = new Map();
              const newLinks = new Map();
              for (const field of fields) {
                (field.type.list
                  ? item[field.name].items
                  : [item[field.name]]
                ).forEach((el: T) => {
                  if (!el) {
                    return;
                  }
                  newNodes.set(el.externalId, el);
                  newLinks.set(
                    `${node.externalId}-${field.name}-${el.externalId}`,
                    {
                      id: `${node.externalId}-${field.name}-${el.externalId}`,
                      source: node.externalId,
                      target: el.externalId,
                      sourceField: field.name,
                      sourceType: clickedTypeName,
                    }
                  );
                });
              }
              // update selected items with the new edges
              newSelectedItems.set(node.externalId, [...newLinks.keys()]);

              const types = new Set(
                [...newNodes.values()].map((it) => it.__typename)
              );

              // update the sidebar menu
              setSelectedField((currValue) => {
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

              // update the nodes and edges
              setNodes((currNodes) => new Map([...currNodes, ...newNodes]));
              setLinks((currLinks) => new Map([...currLinks, ...newLinks]));
            });
          }
        } else {
          // unchecking - remove links and nodes linked to id
          // update selected items
          newSelectedItems.delete(node.externalId);

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
      dataModelType?.name,
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
      !selectedItems.has(initialNodes[0].externalId)
    ) {
      onClick(initialNodes[0]);
    }
  }, []);

  const renderNode = useCallback(
    (node: T) => (
      <NodeItem
        node={node}
        onClick={(n) => {
          onClick(n);

          track('Graph.Expand', {
            node: n.externalId,
          });
        }}
        isSelected={selectedItems.has(node.externalId)}
      />
    ),
    [onClick, selectedItems, track]
  );
  const renderLink = useCallback(
    (el: SimulationLinkDatum<Node & T> & { sourceField?: string }) => {
      const id = getLinkId(el);
      return (
        <g key={`${id}`} className="path">
          <text>
            <textPath href={`#${id}`} startOffset="50%" text-anchor="middle">
              {el.sourceField}
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
    const keys = [...selectedItems.keys()];

    // Return a new array containing filtered links from the `links` Map based on the following conditions:
    // 1. If `disabledFields` is empty, include all links
    // 2. If both the source and target of the link are in the `keys` array, include the link
    // 3. If none of the `disabledFields` match the link's source field and source type, include the link
    return [...links.values()].filter((link) =>
      disabledFields.length === 0
        ? true
        : (keys.includes(link.source) && keys.includes(link.target)) ||
          !disabledFields.some(
            (field) =>
              link.sourceField === field.field && link.sourceType === field.type
          )
    );
  }, [links, disabledFields, selectedItems]);

  // Represents a filtered list of visible nodes
  const visibleNodes = useMemo(() => {
    return [...nodes.values()]
      .filter(
        (node) =>
          // include nodes that are selected
          [...selectedItems.keys()].includes(node.externalId) ||
          // include nodes that are in the 'initialNodes' array
          initialNodes.some(
            (initialNode) => initialNode.externalId === node.externalId
          ) ||
          // include nodes that are connected to other visible nodes
          (disabledFields.length === 0
            ? true
            : visibleLinks.some(
                (link) =>
                  link.source === node.externalId ||
                  link.target === node.externalId
              ))
      )
      .map((el) => ({
        ...el,
        id: el.externalId,
        title: el.externalId,
      }));
  }, [nodes, disabledFields, visibleLinks, initialNodes, selectedItems]);

  return (
    <Graph<T>
      nodes={visibleNodes}
      links={visibleLinks}
      useCache={false}
      renderNode={renderNode}
      renderLink={renderLink}
      autoLayout={false}
      style={{
        position: 'relative',
        backgroundImage: `radial-gradient(
          var(--cogs-border-default) 1px,
          transparent 1px
        )`,
        backgroundSize: '24px 24px',
        backgroundColor: 'var(--cogs-bg-canvas)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontSize: 12,
        }}
      >
        {Object.entries(selectedFields).map(([key, fields]) => (
          <>
            <div style={{ marginTop: 12 }}>
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
          </>
        ))}
      </div>
    </Graph>
  );
};

const NodeItem = <T extends { externalId: string }>({
  node,
  onClick,
  isSelected,
}: {
  node: T & { __typename: string };
  onClick: (node: T) => void;
  isSelected: boolean;
}) => {
  return (
    <div
      key={node.externalId}
      style={{
        padding: 8,
        borderRadius: 4,
        background: '#fff',
        width: 160,
        maxHeight: 120,
        transform: 'translate(-50%, -50%)',
        border: `1px solid ${getColor(node.__typename).color}`,
      }}
      onClick={() => {
        onClick(node);
      }}
    >
      <Chip
        hideTooltip
        size="small"
        label={node.__typename}
        style={{
          position: 'absolute',
          bottom: '100%',
          fontSize: 12,
          left: 0,
          minHeight: 'auto',
          backgroundColor: getColor(node.__typename).color,
        }}
        prominence={getColor(node.__typename).isLight ? 'muted' : 'strong'}
      />
      <Flex gap={2} alignItems="center">
        <Body
          level={3}
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.externalId}
        </Body>
        {isSelected && (
          <Flex
            alignItems="center"
            style={{
              color: Colors['surface--status-success--strong--default'],
            }}
          >
            <Icon type="EyeShow" />
          </Flex>
        )}
      </Flex>
    </div>
  );
};
