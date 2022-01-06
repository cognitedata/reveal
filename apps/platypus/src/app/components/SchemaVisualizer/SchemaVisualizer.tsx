import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { CSSProperties } from 'styled-components/macro';
import {
  Badge,
  Button,
  Checkbox,
  Colors,
  Dropdown,
  Icon,
  Input,
  Menu,
  Modal,
  TopBar,
} from '@cognite/cogs.js';
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

export const SchemaVisualizer = ({
  graphQLSchemaString,
}: {
  graphQLSchemaString: string;
}) => {
  const [nodes, setNodes] = useState<(Node & SchemaDefinitionNode)[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  // if set, then should render small node instead of full node.
  const [showHeaderOnly, setShowHeaderOnly] = useState<boolean>(false);
  const [highlightMainID, setHighlightMainID] = useState(false);
  const [showRequiredIcon, setShowRequiredIcon] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchFilterValue, setSearchFilterValue] = useState('');
  const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(false);

  const graphRef = useRef<GraphFns | null>(null);

  const schemaTypes = useMemo(
    () => parse(graphQLSchemaString as string).definitions,
    [graphQLSchemaString]
  );

  const [popover, setPopover] = useState<React.ReactNode | undefined>(
    undefined
  );
  const debouncedPopover = useDebounce(popover, 100);

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
          .includes(searchFilterValue.toLowerCase().trim())
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
  }, [schemaTypes, searchFilterValue]);

  const onClick = (id: string) => {
    const newSet = new Set(selected);
    if (selected.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  const zoomInHandler = () => {
    graphRef?.current?.zoomIn();
  };

  const zoomOutHandler = () => {
    graphRef.current?.zoomOut();
  };

  const fitHandler = () => {
    graphRef.current?.fitContent();
  };

  // because of async function, we need to debounce by 100 by default
  const rerenderHandler = (debounce = 100) => {
    setTimeout(() => graphRef.current?.forceRerender(), debounce);
  };

  const dropdownContent = (
    <Menu>
      <Menu.Header>display:</Menu.Header>
      <Menu.Item>
        <Checkbox
          name="mainID"
          value={highlightMainID}
          onChange={(nextState: boolean) => {
            setHighlightMainID(nextState);
            rerenderHandler();
          }}
        >
          MainID
        </Checkbox>
      </Menu.Item>
      <Menu.Item>
        <Checkbox
          name="required"
          value={showRequiredIcon}
          onChange={(nextState: boolean) => {
            setShowRequiredIcon(nextState);
            rerenderHandler();
          }}
        >
          Required
        </Checkbox>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <Checkbox
          name="headersOnly"
          value={showHeaderOnly}
          onChange={(nextState: boolean) => {
            setShowHeaderOnly(nextState);
            rerenderHandler();
          }}
        >
          Headers Only
        </Checkbox>
      </Menu.Item>
    </Menu>
  );

  const countFilters =
    (showRequiredIcon ? 1 : 0) +
    (showHeaderOnly ? 1 : 0) +
    (highlightMainID ? 1 : 0);

  const renderTopBar = () => (
    <div
      style={{
        position: 'absolute',
        top: 5,
        left: 410,
        zIndex: ZIndex.Toolbar,
      }}
    >
      <StyledTopBar>
        <TopBar.Item className="cogs-topbar--item__search">
          <Icon type="Search" />
          <Input
            placeholder="Search"
            value={searchFilterValue}
            onChange={(e) => setSearchFilterValue(e.target.value)}
          />
        </TopBar.Item>
        <StyledTopBarItemWithMenu>
          <Dropdown
            content={dropdownContent}
            visible={menuVisible}
            onClickOutside={() => {
              setMenuVisible(false);
            }}
          >
            <Button type="ghost" onClick={() => setMenuVisible(!menuVisible)}>
              <StyledFilterIcon type="Filter" />
              <Badge text={`${countFilters}`} />
            </Button>
          </Dropdown>
        </StyledTopBarItemWithMenu>
        <TopBar.Actions
          actions={[
            {
              key: 'zoomIn',
              component: <Icon type="ZoomIn" />,
              onClick: () => zoomInHandler(),
            },
            {
              key: 'ZoomOut',
              component: <Icon type="ZoomOut" />,
              onClick: () => zoomOutHandler(),
            },
            {
              key: 'ExpandMax',
              component: <Icon type="FullScreen" />,
              onClick: () => fitHandler(),
            },
          ]}
        />
        <TopBar.Actions
          actions={[
            {
              key: 'Expand',
              component: (
                <Icon type={isVisualizerExpanded ? 'Collapse' : 'Expand'} />
              ),
              onClick: () => setIsVisualizerExpanded(!isVisualizerExpanded),
            },
          ]}
        />
      </StyledTopBar>
    </div>
  );

  const renderConnectorsForNode = useMemo(
    () => connectorsGenerator(nodes, links, showHeaderOnly, showRequiredIcon),
    [nodes, links, showHeaderOnly, showRequiredIcon]
  );

  const renderGraph = () => (
    <>
      {renderTopBar()}
      <Graph<SchemaDefinitionNode>
        graphRef={graphRef}
        nodes={nodes}
        links={links}
        initialZoom={10}
        useCurve
        getOffset={(...params) =>
          getOffset(...params)(showHeaderOnly, showRequiredIcon)
        }
        onLinkEvent={(type, data, event) => {
          // trigger popover
          switch (type) {
            case 'mouseover': {
              setHighlightedIds([
                getLinkId(data),
                (data.source as SchemaDefinitionNode).name.value,
                (data.target as SchemaDefinitionNode).name.value,
              ]);
              setPopover(
                <Popover
                  style={{
                    top: event.offsetY + 16,
                    left: event.offsetX,
                    transform: 'translate(-50%,0)',
                  }}
                >
                  {getLinkText(data)}
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
            style.strokeWidth = 2;
            style.stroke = Colors['greyscale-grey7'].hex();
          }
          return <path className="line" key={id} id={id} style={style} />;
        }}
        renderNode={(item, _, displayedNodes) => {
          const isActive = selected.has(item.id);
          const style: CSSProperties = {};
          if (highlightedIds.includes(item.id)) {
            style.borderColor = Colors['greyscale-grey7'].hex();
          }
          const nodeWidth = getNodeWidth(item, showRequiredIcon);
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
                    showRequiredIcon={showRequiredIcon}
                  />
                );
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
              isActive={isActive}
              width={nodeWidth}
              id={item.id}
              key={item.id}
              title={item.title}
              onClick={() => onClick(item.id)}
              style={style}
            >
              {renderConnectorsForNode(item, displayedNodes)}
              {content}
            </NodeWrapper>
          );
        }}
      >
        {debouncedPopover}
      </Graph>
    </>
  );

  return (
    <div id="visualizer-wrapper" style={{ height: '100%' }}>
      {isVisualizerExpanded ? (
        <StyledModal
          appElement={
            document.getElementById('visualizer-wrapper') || undefined
          }
          visible={isVisualizerExpanded}
          footer={null}
          onCancel={() => {
            setIsVisualizerExpanded(false);
          }}
        >
          {renderGraph()}
        </StyledModal>
      ) : (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          {renderGraph()}
        </div>
      )}
    </div>
  );
};

const StyledModal = styled(Modal)`
  top: -20px;
  width: 95% !important;
  height: 90%;
  overflow: hidden;

  .cogs-modal-content {
    padding: 0;
    height: 100%;

    & > div:first-child {
      top: 22px !important;
    }
  }

  .cogs-modal-close {
    z-index: ${ZIndex.ModalContent};
    margin: 22px 14px 0px 8px;
    border: 1px solid var(--cogs-greyscale-grey8);
    border-radius: 50%;
    height: 28px;
    padding: 5px;
    color: var(--cogs-greyscale-grey8);
  }
`;
interface ITypeItem {
  isActive: boolean;
  width?: number;
}

const NodeWrapper = styled.div<ITypeItem>`
  padding: 10px 14px;
  width: ${(props: ITypeItem) =>
    props.width ? `${props.width}px` : `${NODE_WIDTH}px`};
  background-color: ${(props: ITypeItem) =>
    props.isActive ? 'var(--cogs-midblue-8)' : 'var(--cogs-white)'};
  border: 1px solid;
  border-color: ${(props: ITypeItem) =>
    props.isActive ? 'var(--cogs-midblue-4)' : 'var(--cogs-greyscale-grey5)'};
  border-radius: 4px;
  box-shadow: 0px 0px 12px var(--cogs-greyscale-grey3);
  .cogs-body-2 {
    color: var(--cogs-greyscale-grey6);
  }
  .cogs-title-5 {
    color: var(--cogs-greyscale-grey9);
  }
`;

const Popover = styled.div`
  position: absolute;
  background: var(--cogs-midblue-7);
  padding: 2px 4px;
`;

const StyledTopBar = styled(TopBar)`
  background-color: #fff;
  border-top: 1px solid var(--cogs-border-default);
  border-right: 1px solid var(--cogs-border-default);
`;

const StyledFilterIcon = styled(Icon)`
  cursor: pointer;
  margin-right: 6px;
`;

const StyledTopBarItemWithMenu = styled(TopBar.Item)`
  & > span:first-child {
    width: 80px;
    height: 100%;

    > .cogs-btn {
      width: 100%;
      height: 100%;
      padding: 0;
      border-radius: 0;
      color: var(--cogs-greyscale-grey8);
    }
  }

  & > div:nth-child(2) {
    transform: translate3d(228px, 56px, 0px) !important;
  }
`;
