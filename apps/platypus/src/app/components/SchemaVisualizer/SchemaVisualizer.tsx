import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BuiltInType } from '@platypus/platypus-core';
import { Kind, parse } from 'graphql';
import noop from 'lodash/noop';
import styled, { CSSProperties } from 'styled-components/macro';

import { Body, Button, Colors, Flex, Modal, Title } from '@cognite/cogs.js';

import { useDebounce } from '../../hooks/useDebounce';
import { useMixpanel } from '../../hooks/useMixpanel';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getInterfaceTypes,
  getLinkedNodes,
  getObjectTypes,
  getUnionTypes,
  SchemaDefinitionNode,
} from '../../utils/graphql-utils';
import zIndex from '../../utils/zIndex';
import {
  Node,
  Link,
  Graph,
  GraphFns,
  getLinkId,
  RenderNodeFunction,
  RenderLinkFunction,
} from '../Graph/GraphEngine';
import { Spinner } from '../Spinner/Spinner';

import { FullNode } from './nodes/FullNode';
import { SmallNode } from './nodes/SmallNode';
import { UnionNode } from './nodes/UnionNode';
import {
  getLinkText,
  getNodeId,
  getNodeWidth,
  getLinkEndOffset,
  NODE_WIDTH,
  getConnectorHeight,
} from './utils';
import { VisualizerToolbar } from './VisualizerToolbar';

export interface SchemaVisualizerConfig {
  /* Set known types to control which types and field directives will be rendered and their styling */
  knownTypes?: BuiltInType[];
}

const OFFSET_TOP = 2;
export const SchemaVisualizer = React.memo(
  ({
    graphQLSchemaString,
    active,
    isVisualizerOn = true,
    onNodeClick = noop,
  }: {
    graphQLSchemaString?: string;
    active?: string;
    isVisualizerOn?: boolean;
    onNodeClick?: (nodeName: string) => void;
    /* Customize the Visualizer rendering */
  }) => {
    const { t } = useTranslation('Schema Visualizer');
    const [nodes, setNodes] = useState<(Node & SchemaDefinitionNode)[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

    // if set, then should render small node instead of full node.
    const [showHeaderOnly, setShowHeaderOnly] = useState<boolean>(false);
    const [searchFilterValue, setSearchFilterValue] = useState('');
    const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const graphRef = useRef<GraphFns | null>(null);

    const { track } = useMixpanel();

    useEffect(() => {
      track('DataModel.Visualize', { isOpen: isVisualizerExpanded });
    }, [isVisualizerExpanded, track]);

    const schemaTypes = useMemo(() => {
      setErrorMessage('');
      if (!graphQLSchemaString || graphQLSchemaString.trim() === '') {
        setIsLoading(false);
        return [];
      }

      if (!isVisualizerOn) {
        setErrorMessage(
          t(
            'visualizer_preview_off',
            'Data model preview is currently turned off'
          )
        );
        setIsLoading(false);
        return [];
      }

      try {
        const { definitions } = parse(graphQLSchemaString || '');
        return definitions;
      } catch {
        // TODO: Add sentry
        setErrorMessage(
          t(
            'visualizer_validation_error',
            "There's a validation error in your data model."
          )
        );
        setIsLoading(false);
        return [];
      }
    }, [t, graphQLSchemaString, setErrorMessage, isVisualizerOn]);

    const [popover, setPopover] = useState<React.ReactNode | undefined>(
      undefined
    );
    const debouncedPopover = useDebounce(popover, 100);
    const debouncedSearchValue = useDebounce(searchFilterValue, 100);

    useEffect(() => {
      if (schemaTypes) {
        const objectTypes: SchemaDefinitionNode[] = [
          ...getObjectTypes(schemaTypes),
          ...getInterfaceTypes(schemaTypes),
          ...getUnionTypes(schemaTypes),
        ];
        const filteredObjectTypes = objectTypes?.filter((objectType) =>
          objectType.name.value
            .toLowerCase()
            .includes(debouncedSearchValue.toLowerCase().trim())
        );
        setNodes(
          filteredObjectTypes.map((type) => ({
            title: type.name.value,
            id: getNodeId(type),
            ...type,
          })) as (Node & SchemaDefinitionNode)[]
        );
        setLinks(
          filteredObjectTypes.reduce((prev, current) => {
            const linkedNodes = getLinkedNodes(
              current.name.value,
              filteredObjectTypes
            );
            const newLinks = linkedNodes.map((linkedNode) => ({
              source: getNodeId(current),
              target: getNodeId(linkedNode.type),
              id: linkedNode.field
                ? `${current.name.value}.${linkedNode.field}`
                : `${current.name.value}-${linkedNode.type.name.value}`,
            }));
            return prev.concat(
              newLinks.concat(
                newLinks.map((el) => ({ ...el, id: `${el.id}-hover` }))
              )
            );
          }, [] as Link[])
        );
        rerenderHandler();
      }
    }, [schemaTypes, debouncedSearchValue]);

    // because of async function, we need to debounce by 100 by default
    const rerenderHandler = (debounce = 100) => {
      setTimeout(() => graphRef.current?.forceRerender(), debounce);
    };

    const renderNode = useCallback<RenderNodeFunction<SchemaDefinitionNode>>(
      (item, fullRender) => {
        const nodeWidth = getNodeWidth(item);
        let content = <p>Loading&hellip;</p>;
        switch (item.kind) {
          case 'ObjectTypeDefinition': {
            if (showHeaderOnly) {
              content = <SmallNode key={item.name.value} item={item} />;
            } else {
              content = (
                <FullNode
                  key={item.name.value}
                  item={item}
                  fullRender={fullRender}
                />
              );
            }
            break;
          }
          case 'InterfaceTypeDefinition': {
            if (showHeaderOnly) {
              content = <SmallNode key={item.name.value} item={item} />;
            } else {
              content = (
                <FullNode
                  key={item.name.value}
                  item={item}
                  fullRender={fullRender}
                  isInterface
                />
              );
            }
            break;
          }
          case 'UnionTypeDefinition': {
            content = <UnionNode key={item.name.value} item={item} />;
            break;
          }
        }
        return (
          <NodeWrapper
            isActive={active === item.id}
            width={nodeWidth}
            id={item.id}
            key={item.id}
            title={item.title}
            onClick={() => {
              if (
                item.kind === 'ObjectTypeDefinition' ||
                item.kind === 'InterfaceTypeDefinition'
              ) {
                onNodeClick(item.title);
              }
            }}
            onMouseEnter={() => {
              // Highlight links when hovering a node
              setHighlightedIds(
                links
                  .filter(
                    (el) => el.source === item.id || el.target === item.id
                  )
                  .map((link) => getLinkId(link))
              );
            }}
            onMouseLeave={() => {
              setHighlightedIds([]);
            }}
          >
            {content}
          </NodeWrapper>
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [active, links, showHeaderOnly]
    );

    const renderLink = useCallback<RenderLinkFunction<SchemaDefinitionNode>>(
      (item) => {
        const id = getLinkId(item);
        if (id.endsWith('-hover')) {
          //hover item
          return (
            <g className="path">
              <path
                style={{ strokeWidth: 40, stroke: 'transparent' }}
                key={id}
                id={id}
              />
            </g>
          );
        }
        const style: CSSProperties = {
          zIndex: zIndex.MAXIMUM,
          strokeWidth: 1,
          stroke: Colors['decorative--grayscale--500'],
        };
        if (highlightedIds.includes(id)) {
          style.stroke = Colors['border--muted--inverted'];
        }
        return (
          <g className="path" key={id}>
            <path
              markerStart="url(#indicator)"
              markerEnd="url(#indicator)"
              style={style}
              key={id}
              id={id}
            />
          </g>
        );
      },
      [highlightedIds]
    );

    const getNodeWidthHeight = useCallback((node: SchemaDefinitionNode) => {
      switch (node.kind) {
        case Kind.OBJECT_TYPE_DEFINITION:
        case Kind.INTERFACE_TYPE_DEFINITION:
          return {
            width: NODE_WIDTH,
            height: getConnectorHeight((node.fields || []).length + 1),
          };
        default:
          return { width: NODE_WIDTH, height: 0 };
      }
    }, []);

    const renderGraph = () => (
      <Wrapper direction="column">
        {isLoading && (
          <WrappedSpinner data-cy="visualizer_loader">
            <Spinner />
          </WrappedSpinner>
        )}
        <Flex
          alignItems="center"
          gap={16}
          direction="row"
          className="toolbar"
          style={{ marginRight: isVisualizerExpanded ? '8px' : 'auto' }}
        >
          <VisualizerToolbar
            searchFilterValue={searchFilterValue}
            setSearchFilterValue={setSearchFilterValue}
            isCollapsed={showHeaderOnly}
            setIsCollapsed={setShowHeaderOnly}
            isVisualizerExpanded={isVisualizerExpanded}
            setIsVisualizerExpanded={setIsVisualizerExpanded}
            zoomInHandler={() => {
              graphRef?.current?.zoomIn();
            }}
            zoomOutHandler={() => {
              graphRef.current?.zoomOut();
            }}
            fitHandler={() => {
              graphRef.current?.fitContent();
            }}
          />
          {isVisualizerExpanded && (
            <Button
              type="ghost"
              icon="CloseLarge"
              onClick={() => setIsVisualizerExpanded(false)}
            />
          )}
        </Flex>
        {errorMessage ? (
          <Flex
            alignItems="center"
            justifyContent="center"
            style={{ flex: 1 }}
            direction="column"
            data-cy="schema-visualizer-err-ctr"
          >
            <Title level={5} style={{ textAlign: 'center', marginBottom: 16 }}>
              {t('failed_to_load', 'Unable to visualize the Data Model.')}
            </Title>
            <i>{errorMessage}</i>
          </Flex>
        ) : (
          <Graph<SchemaDefinitionNode>
            graphRef={graphRef}
            nodes={nodes}
            links={links}
            style={{ flex: 1 }}
            onLoadingStatus={setIsLoading}
            autoLayout={getNodeWidthHeight}
            useCurve
            offset={{ top: OFFSET_TOP }}
            getLinkEndOffset={(...params) =>
              getLinkEndOffset(...params)(showHeaderOnly)
            }
            onLinkEvent={(type, data, event) => {
              switch (type) {
                case 'mouseover': {
                  // Highlight link and its source and target on hover
                  setHighlightedIds([
                    getLinkId(data).replace('-hover', ''),
                    (data.source as SchemaDefinitionNode).name.value,
                    (data.target as SchemaDefinitionNode).name.value,
                  ]);
                  setPopover(
                    <Popover
                      className="tippy-box cogs-tooltip"
                      style={{
                        top: event.clientY + 20,
                        left: event.clientX,
                        transform: 'translate(-50%,0)',
                        position: 'fixed',
                      }}
                    >
                      <div className="tippy-content">
                        <Body
                          level={2}
                          style={{ color: `var(--cogs-text-inverted)` }}
                        >
                          {getLinkText(data)}
                        </Body>
                      </div>
                    </Popover>
                  );
                  break;
                }
                case 'mouseout': {
                  setHighlightedIds([]);
                  setPopover(undefined);
                }
              }
            }}
            renderLink={renderLink}
            renderNode={renderNode}
            additionalSvgDefs={
              <defs>
                <marker
                  id="indicator"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="10"
                  markerHeight="10"
                  orient="auto"
                >
                  <circle r="5" cx="5" cy="5" className="indicator" />
                </marker>
              </defs>
            }
          />
        )}
        {debouncedPopover}
      </Wrapper>
    );

    return (
      <div id="visualizer-wrapper" style={{ height: '100%' }}>
        {isVisualizerExpanded ? (
          <StyledModal
            title={t('full_screen_title', 'Data model preview')}
            getContainer={
              document.getElementById('visualizer-wrapper') || undefined
            }
            closable={false}
            visible={isVisualizerExpanded}
            hideFooter
            size="full-screen"
            onCancel={() => {
              setIsVisualizerExpanded(false);
            }}
          >
            {renderGraph()}
          </StyledModal>
        ) : (
          renderGraph()
        )}
      </div>
    );
  }
);

const Wrapper = styled(Flex)`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-image: radial-gradient(
    var(--cogs-border-default) 1px,
    transparent 1px
  );
  background-color: var(--cogs-bg-canvas);
  background-size: 24px 24px;

  .toolbar {
    margin: 16px auto;
    z-index: ${zIndex.TOOLBAR};
  }

  .indicator {
    fill: var(--cogs-purple-3);
    z-index: ${zIndex.INDICATOR};
  }
`;

const StyledModal = styled(Modal)`
  overflow: hidden;
  padding: 0;

  .cogs-modal-content {
    padding: 0;
    height: 100%;
  }

  .cogs-modal-close {
    display: none;
  }
`;
interface ITypeItem {
  isActive: boolean;
  width?: number;
}

export const NodeWrapper = styled.div<ITypeItem>`
  padding: 10px 12px;
  width: ${(props: ITypeItem) =>
    props.width ? `${props.width}px` : `${NODE_WIDTH}px`};
  background-color: ${(props: ITypeItem) =>
    props.isActive ? 'var(--cogs-bg-selected)' : 'var(--cogs-white)'};
  border: 1px solid;
  border-color: ${(props: ITypeItem) =>
    props.isActive ? 'var(--cogs-midblue-4)' : 'var(--cogs-greyscale-grey5)'};
  border-radius: 4px;
  box-shadow: 0px 0px 12px var(--cogs-greyscale-grey3);
  z-index: ${zIndex.MINIMUM};

  &&:hover {
    border-color: var(--cogs-border-inverted);
  }
`;

const Popover = styled.div`
  position: absolute;
`;

const WrappedSpinner = styled.div`
  top: 0;
  left: 0;
  position: absolute;
  background: var(--cogs-bg-canvas);
  width: 100%;
  height: 100%;
  z-index: ${zIndex.TOOLBAR};
`;
