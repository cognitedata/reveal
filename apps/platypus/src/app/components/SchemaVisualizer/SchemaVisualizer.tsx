import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { CSSProperties } from 'styled-components/macro';
import { Body, Button, Colors, Flex, Modal, Title } from '@cognite/cogs.js';
import { parse } from 'graphql';
import { useDebounce } from '../../hooks/useDebounce';
import { Node, Link, Graph, GraphFns, getLinkId } from '../Graph/Graph';
import { getLinkText, getNodeWidth, getOffset, NODE_WIDTH } from './utils';

import {
  getInterfaceTypes,
  getLinkedNodes,
  getObjectTypes,
  getUnionTypes,
  SchemaDefinitionNode,
} from '../../utils/graphql-utils';

import { ZIndex } from '../../utils/zIndex';
import { SmallNode } from './nodes/SmallNode';
import { FullNode } from './nodes/FullNode';
import { InterfaceNode } from './nodes/InterfaceNode';
import { UnionNode } from './nodes/UnionNode';
import { connectorsGenerator } from './connectors';
import { VisualizerToolbar } from './VisualizerToolbar';
import { Spinner } from '../Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { BuiltInType } from '@platypus/platypus-core';
import { usePersistedState } from '@platypus-app/hooks/usePersistedState';

export interface SchemaVisualizerConfig {
  /* Set known types to control which types and field directives will be rendered and their styling */
  knownTypes?: BuiltInType[];
}

export const SchemaVisualizer = React.memo(
  ({
    graphQLSchemaString,
    active,
    config = {
      knownTypes: [],
    },
  }: {
    graphQLSchemaString?: string;
    active?: string;
    /* Customize the Visualizer rendering */
    config?: SchemaVisualizerConfig;
  }) => {
    const { t } = useTranslation('Schema Visualizer');
    const [nodes, setNodes] = useState<(Node & SchemaDefinitionNode)[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

    // if set, then should render small node instead of full node.
    const [showHeaderOnly, setShowHeaderOnly] = usePersistedState<boolean>(
      false,
      'SHOW_HEADER_ONLY'
    );
    const [searchFilterValue, setSearchFilterValue] = useState('');
    const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(false);
    const [isErrorState, setIsError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const graphRef = useRef<GraphFns | null>(null);

    const schemaTypes = useMemo(() => {
      try {
        const { definitions } = parse(graphQLSchemaString || '');
        setIsError(false);
        return definitions;
      } catch {
        // TODO: Add sentry
        setIsError(true);
        setIsLoaded(true);
        return [];
      }
    }, [graphQLSchemaString, setIsError]);

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
            id: type.name.value,
            ...type,
          })) as (Node & SchemaDefinitionNode)[]
        );
        setLinks(
          filteredObjectTypes.reduce((prev, current) => {
            const linkedNodes = getLinkedNodes(
              current.name.value,
              filteredObjectTypes
            );
            prev.push(
              ...linkedNodes.map((linkedNode) => ({
                source: current.name.value,
                target: linkedNode.name.value,
              }))
            );
            return prev;
          }, [] as Link[])
        );
        rerenderHandler();
      }
    }, [schemaTypes, debouncedSearchValue]);

    // because of async function, we need to debounce by 100 by default
    const rerenderHandler = (debounce = 100) => {
      setTimeout(() => graphRef.current?.forceRerender(), debounce);
    };

    const renderConnectorsForNode = useMemo(
      () => connectorsGenerator(nodes, links, showHeaderOnly),
      [nodes, links, showHeaderOnly]
    );

    const renderGraph = () => (
      <Wrapper direction="column">
        {!isLoaded && (
          <WrappedSpinner>
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
              variant="ghost"
              icon="CloseLarge"
              onClick={() => setIsVisualizerExpanded(false)}
            />
          )}
        </Flex>
        {isErrorState ? (
          <Flex
            alignItems="center"
            justifyContent="center"
            style={{ flex: 1 }}
            direction="column"
          >
            <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
              {t('failed_to_load', 'Unable to visualize the Data Model.')}
            </Title>
            <Body>
              {t(
                'failed_to_load_description',
                'Have you created a Data Model already?'
              )}
            </Body>
          </Flex>
        ) : (
          <Graph<SchemaDefinitionNode>
            graphRef={graphRef}
            nodes={nodes}
            links={links}
            initialZoom={10}
            style={{ flex: 1 }}
            onLoadingStatus={setIsLoaded}
            useCurve
            getOffset={(...params) => getOffset(...params)(showHeaderOnly)}
            onLinkEvent={(type, data, event) => {
              switch (type) {
                case 'mouseover': {
                  // Highlight link and its source and target on hover
                  setHighlightedIds([
                    getLinkId(data),
                    (data.source as SchemaDefinitionNode).name.value,
                    (data.target as SchemaDefinitionNode).name.value,
                  ]);
                  setPopover(
                    <Popover
                      className="tippy-box cogs-tooltip"
                      style={{
                        top: event.offsetY + 16,
                        left: event.offsetX,
                        transform: 'translate(-50%,0)',
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
            renderLink={(item) => {
              const id = getLinkId(item);
              const style: CSSProperties = {
                strokeWidth: 1,
                stroke: Colors['greyscale-grey5'].hex(),
              };
              if (highlightedIds.includes(id)) {
                style.stroke = Colors['border-inverted'].hex();
              }
              return <path className="line" key={id} id={id} style={style} />;
            }}
            renderNode={(item, _, displayedNodes) => {
              const style: CSSProperties = {};
              if (highlightedIds.includes(item.id)) {
                style.borderColor = Colors['greyscale-grey7'].hex();
              }
              const nodeWidth = getNodeWidth(item);
              let content = <p>Loading&hellip;</p>;
              switch (item.kind) {
                case 'ObjectTypeDefinition': {
                  if (showHeaderOnly) {
                    content = <SmallNode key={item.name.value} item={item} />;
                  } else {
                    content = <FullNode key={item.name.value} item={item} />;
                  }
                  break;
                }
                case 'InterfaceTypeDefinition': {
                  content = <InterfaceNode key={item.name.value} item={item} />;
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
                  style={style}
                  onMouseEnter={() => {
                    // Highlight links when hovering a node
                    setHighlightedIds(
                      links
                        .filter(
                          (el) => el.source === item.id || el.target === item.id
                        )
                        .map(getLinkId)
                    );
                  }}
                  onMouseLeave={() => {
                    setHighlightedIds([]);
                  }}
                >
                  {renderConnectorsForNode(item, displayedNodes)}
                  {content}
                </NodeWrapper>
              );
            }}
          >
            {debouncedPopover}
          </Graph>
        )}
      </Wrapper>
    );

    return (
      <div id="visualizer-wrapper" style={{ height: '100%' }}>
        {isVisualizerExpanded ? (
          <StyledModal
            appElement={
              document.getElementById('visualizer-wrapper') || undefined
            }
            closable={false}
            visible={isVisualizerExpanded}
            footer={null}
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
    z-index: ${ZIndex.Toolbar};
  }
`;

const StyledModal = styled(Modal)`
  top: -20px;
  width: 95% !important;
  height: 90%;
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
  z-index: ${ZIndex.Toolbar};
`;
