/* eslint-disable no-underscore-dangle */
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as d3 from 'd3';
import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import styled from 'styled-components/macro';

import { HtmlElementProps } from '../../types';

import { getNodesKey, loadFromCache, saveToCache } from './cache';
import { getELKNodes } from './layout/elkLayout';
import { getFitContentXYK } from './layout/fitLayout';

export type Node = SimulationNodeDatum & {
  id: string;
  title: string;
  initialX?: number;
  initialY?: number;
};

export type Link = { source: string; target: string; id?: string };

const getMidPoint = (x = 0, y = 0) => (x + y) / 2;

export const INITIAL_TRANSFORM = { k: 1, x: 0, y: 0 };
const FULL_RENDER_LIMIT = 0.3;
const ALPHA_ANIMATING_LIMIT = 0.1;

export const getLinkId = (
  link: SimulationLinkDatum<Node> & { id?: string }
) => {
  if (link.id) {
    return link.id;
  }
  const fromId = (link.source as Node).id
    ? (link.source as Node).id
    : link.source;
  const toId = (link.target as Node).id
    ? (link.target as Node).id
    : link.target;
  return `${fromId}-${toId}`;
};

const HALF_PIN_WIDTH = 0;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;
export const TIMEOUT = 10000;
export const DEFAULT_KEY = 'DefaultKey';

export type RenderNodeFunction<T> = (
  item: Node & T,
  fullRender: boolean
) => React.ReactElement<{ id: string }>;

export type RenderLinkFunction<T> = (
  item: SimulationLinkDatum<Node & T>
) => React.ReactElement<{ id: string }>;
export interface GraphProps<T> {
  renderNode: RenderNodeFunction<T>;
  renderLink?: RenderLinkFunction<T>;
  nodes: (Node & T)[];
  links: Link[];
  useCurve?: boolean;
  useCache?: boolean;
  children?: React.ReactNode;
  autoLayout?: (node: Node & T) => { width: number; height: number };
  offset?: { top?: number; left?: number; right?: number; bottom?: number };
  getLinkEndOffset?: GetLinkEndOffsetFn<T>;
  graphRef?: React.Ref<GraphFns>;
  additionalSvgDefs?: React.ReactNode;
  onLinkEvent?: (
    type: 'mouseover' | 'mouseout' | 'click',
    data: SimulationLinkDatum<Node & T>,
    origEvent: any
  ) => void;
  onLoadingStatus?: (isLoaded: boolean) => void;
}

export type GetLinkEndOffsetFn<T> = (link: SimulationLinkDatum<Node & T>) => {
  source: { x: number; y: number };
  target: { x: number; y: number };
};

const defaultGetOffset = () => ({
  source: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
});

const defaultRenderLink = (el: SimulationLinkDatum<Node>) => {
  const id = getLinkId(el);
  return <path key={id} id={id} />;
};

export type GraphFns = {
  zoomIn: (scaleFactor?: number) => void;
  zoomOut: (scaleFactor?: number) => void;
  fitContent: () => void;
  forceRerender: () => void;
};
export const Graph = <T,>({
  renderNode,
  renderLink = defaultRenderLink,
  nodes: propsNodes = [],
  links: propsLinks = [],
  useCurve = false,
  autoLayout,
  useCache = true,
  getLinkEndOffset = defaultGetOffset,
  onLinkEvent,
  children,
  graphRef: ref,
  onLoadingStatus,
  additionalSvgDefs,
  offset,
  ...htmlProps
}: GraphProps<T> & HtmlElementProps<HTMLDivElement>) => {
  // where the links are drawn
  const svgRef = useRef<SVGSVGElement | null>(null);

  // where the nodes are drawn
  const containerRef = useRef<HTMLDivElement | null>(null);

  // where both the links and nodes div live within (the container)
  const mainWrapperRef = useRef<HTMLDivElement | null>(null);

  // broader d3 controller for behavior
  const [chart, setChart] = useState<
    d3.Selection<SVGSVGElement, any, null, undefined> | undefined
  >(undefined);

  // physics engine for moving nodes around
  const [simulation, setSimulation] = useState<
    d3.Simulation<SimulationNodeDatum, undefined> | undefined
  >(undefined);

  // all of the links tied to D3
  const [d3Links, setD3Links] = useState<
    | d3.Selection<Element, SimulationLinkDatum<Node & T>, Element, any>
    | undefined
  >(undefined);

  // all of the nodes tied to D3
  const [d3Nodes, setD3Nodes] = useState<
    d3.Selection<Element, Node & T, HTMLDivElement | null, unknown> | undefined
  >(undefined);

  const [isFittingContent, setIsFittingContent] = useState<boolean>(
    propsNodes.length === 0 ? false : true
  );
  const [isAutoLayouting, setIsAutoLayouting] = useState<boolean>(false);
  const [isAnimating, setIsAnimation] = useState<boolean>(false);
  const [nodes, setNodes] = useState<(Node & T)[]>([]);

  const [transform, setTransform] = useState<{
    k: number;
    x: number;
    y: number;
  }>(INITIAL_TRANSFORM);

  useEffect(() => {
    if (autoLayout) {
      setTransform(INITIAL_TRANSFORM);
    } else if (simulation) {
      simulation.alpha(0).stop();
    }
  }, [propsNodes, autoLayout, simulation]);

  const isLoading = useMemo(() => {
    if (autoLayout) {
      return isFittingContent || isAutoLayouting;
    } else {
      return isAnimating;
    }
  }, [isFittingContent, isAutoLayouting, isAnimating, autoLayout]);

  useEffect(() => {
    if (onLoadingStatus) {
      onLoadingStatus(isLoading);
    }
  }, [onLoadingStatus, isLoading]);

  useEffect(() => {
    setNodes((currNodes) => {
      const nodesMap = new Map(currNodes.map((el) => [el.id, el]));
      const cacheItems = loadFromCache(
        autoLayout ? getNodesKey(propsNodes) : DEFAULT_KEY
      );
      const nodesWithCachedLocation = propsNodes.map((node) => {
        const currentNode = nodesMap.get(node.id);
        return {
          ...(useCache ? cacheItems[node.id] : undefined),
          vx: 0,
          vy: 0,
          ...node,
          ...(currentNode
            ? {
                fx: currentNode.fx,
                fy: currentNode.fy,
                x: currentNode.x,
                y: currentNode.y,
              }
            : { x: node.initialX, y: node.initialY }),
        };
      });
      // restarting simulation
      if (simulation) {
        const currentIdsSet = new Set(currNodes.map((el) => el.id));
        if (propsNodes.some((el) => currentIdsSet.has(el.id))) {
          simulation.alpha(ALPHA_ANIMATING_LIMIT).restart();
        } else {
          simulation.tick(propsNodes.length * 10);
          simulation.alpha(1).restart();
        }
      }
      return nodesWithCachedLocation;
    });
  }, [propsNodes, simulation, autoLayout, useCache]);

  const links: SimulationLinkDatum<Node & T>[] = useMemo(() => {
    // make lookups easy
    const nodeById: { [key in string]: Node } = {};

    nodes.forEach((node) => {
      nodeById[node.id] = node;
    });

    // make a list of { source: Node, target: Node } based on the link's source/target ids
    const newLinks = propsLinks
      .map(
        (link) =>
          ({
            ...link,
            source: nodeById[link.source],
            target: nodeById[link.target],
          } as SimulationLinkDatum<Node & T>)
      )
      .filter((el) => el.source && el.target);
    return newLinks;
  }, [nodes, propsLinks]);

  const fullRender = transform.k > FULL_RENDER_LIMIT;

  const nodeChildren = useMemo(
    () =>
      nodes.map((el) => (
        <div className="node" key={el.id} id={el.id}>
          {renderNode(el, fullRender)}
        </div>
      )),
    [nodes, renderNode, fullRender]
  );

  const linksChildren = useMemo(
    () => links.map((el) => renderLink(el)),
    [links, renderLink]
  );

  useEffect(() => {
    if (!mainWrapperRef.current || !containerRef.current || !svgRef.current) {
      return;
    }

    // Initializing chart
    const initialChart = d3.select(svgRef.current);

    const initialSimulation = d3.forceSimulation();

    setChart(initialChart);
    setSimulation(initialSimulation);

    return () => {
      initialSimulation.stop();
    };
  }, []);

  // Setting location when ticked
  const ticked = useCallback(
    // global transform values
    ({ x, y, k }: { x: number; y: number; k: number } = transform) => {
      if (containerRef.current && simulation) {
        setIsAnimation(simulation.alpha() > ALPHA_ANIMATING_LIMIT);
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        // determine the amount to scale the node versus wrapper
        // behavior: if zoomed out more than original, scale wrapper
        // other wise, scale the distance between nodes
        const nodeScale = Math.max(k, 1);
        const wrapperScale = Math.min(k, 1);

        // fns to get the transformed locations of source/targets
        const getSourceX = (d: SimulationLinkDatum<Node & T>) =>
          x / wrapperScale +
          nodeScale * (d.source as Node).x! +
          getLinkEndOffset(d).source.x;
        const getSourceY = (d: SimulationLinkDatum<Node & T>) =>
          y / wrapperScale +
          nodeScale * (d.source as Node).y! +
          getLinkEndOffset(d).source.y;
        const getTargetX = (d: SimulationLinkDatum<Node & T>) =>
          x / wrapperScale +
          nodeScale * (d.target as Node).x! +
          getLinkEndOffset(d).target.x;
        const getTargetY = (d: SimulationLinkDatum<Node & T>) =>
          y / wrapperScale +
          nodeScale * (d.target as Node).y! +
          getLinkEndOffset(d).target.y;

        if (d3Links && d3Nodes) {
          const actualCanvasSize = {
            left: 0 - (offset?.left || 0) / wrapperScale,
            top: 0 - (offset?.top || 0) / wrapperScale,
            right: (width + (offset?.right || 0)) / wrapperScale,
            bottom: (height + (offset?.bottom || 0)) / wrapperScale,
          };
          // transform the nodes
          const nodeLocationMap: {
            [key in string]: { x: number; y: number; isVisible: boolean };
          } = {};
          d3Nodes.nodes().forEach((d: any) => {
            const nodeX = x / wrapperScale + nodeScale * d.__data__.x;
            const nodeY = y / wrapperScale + nodeScale * d.__data__.y;
            // if visible
            const isVisible =
              // right side of box visible
              nodeX + d.clientWidth * nodeScale > actualCanvasSize.left &&
              // left side of box visible
              nodeX < actualCanvasSize.right &&
              // bottom side of box visible
              nodeY + d.clientHeight * nodeScale > actualCanvasSize.top &&
              // top side of box visible
              nodeY < actualCanvasSize.bottom;
            nodeLocationMap[d.id] = { x: nodeX, y: nodeY, isVisible };
          });

          const isLinkVisible = (d: SimulationLinkDatum<Node & T>) => {
            // if links that starts or ends with visible nodes, show
            const sourceLocation = nodeLocationMap[(d.source as Node).id];
            const targetLocation = nodeLocationMap[(d.target as Node).id];
            if (!!sourceLocation.isVisible || !!targetLocation.isVisible) {
              return true;
            }
            // if link not in middle of screen, hide
            if (
              // both on left
              (Math.min(sourceLocation.x, targetLocation.x) <
                actualCanvasSize.left &&
                Math.max(sourceLocation.x, targetLocation.x) <
                  actualCanvasSize.left) ||
              // both on right
              (Math.min(sourceLocation.x, targetLocation.x) >
                actualCanvasSize.right &&
                Math.max(sourceLocation.x, targetLocation.x) >
                  actualCanvasSize.right) ||
              // both on top
              (Math.min(sourceLocation.y, targetLocation.y) <
                actualCanvasSize.top &&
                Math.max(sourceLocation.y, targetLocation.y) <
                  actualCanvasSize.top) ||
              // both on bottom
              (Math.min(sourceLocation.y, targetLocation.y) >
                actualCanvasSize.bottom &&
                Math.max(sourceLocation.y, targetLocation.y) >
                  actualCanvasSize.bottom)
            ) {
              return false;
            }
            return true;
          };

          // transform the nodes
          d3Nodes
            .classed('invisible', true)
            .filter((d) => nodeLocationMap[d.id]?.isVisible)
            .classed('invisible', false)
            .attr('style', (d: any) => {
              const nodeX = x / wrapperScale + nodeScale * d.x;
              const nodeY = y / wrapperScale + nodeScale * d.y;
              return `left: ${nodeX}px; top: ${nodeY}px`;
            });
          d3Links
            .classed('hidden', true)
            .filter(isLinkVisible)
            .classed('hidden', false)
            // select the actual path (since links can be svg groups containing a path within)
            .select('path')
            .attr('d', (d: SimulationLinkDatum<Node & T>) => {
              if (!d.source && !d.target) {
                return '';
              }
              const midXY = {
                x: getMidPoint(getTargetX(d), getSourceX(d)),
                y: getMidPoint(getTargetY(d), getSourceY(d)),
              };
              const curve: (string | number)[] = useCurve
                ? [
                    'M',
                    (getTargetX(d) || 0) + HALF_PIN_WIDTH,
                    (getTargetY(d) || 0) + HALF_PIN_WIDTH,
                    'Q',
                    midXY.x + HALF_PIN_WIDTH,
                    (getTargetY(d) || 0) + HALF_PIN_WIDTH,
                    midXY.x + HALF_PIN_WIDTH,
                    midXY.y + HALF_PIN_WIDTH,
                    'Q',
                    midXY.x + HALF_PIN_WIDTH,
                    (getSourceY(d) || 0) + HALF_PIN_WIDTH,
                    (getSourceX(d) || 0) + HALF_PIN_WIDTH,
                    (getSourceY(d) || 0) + HALF_PIN_WIDTH,
                  ]
                : [
                    'M',
                    `${getSourceX(d)}, ${getSourceY(d)}`,
                    'L',
                    `${getTargetX(d)}, ${getTargetY(d)}`,
                  ];
              return curve.join(' ');
            });
        }
        // scale relative to the center to zoom around the x, y
        const preTransform = `translate(-${width / 2}px,-${height / 2}px)`;
        const postTransform = `translate(${width / 2}px,${height / 2}px)`;
        containerRef.current!.style.transform = `${preTransform} scale(${wrapperScale}) ${postTransform}`;
      }
    },
    [
      d3Nodes,
      d3Links,
      simulation,
      transform,
      useCurve,
      getLinkEndOffset,
      containerRef,
      offset,
    ]
  );

  useEffect(() => {
    ticked(transform);
  }, [transform, ticked]);

  const onZoom = useCallback(
    (transformation: { k: number; x: number; y: number }) => {
      // this is called because d3 keeps internal state with "d3.zoom" which needs to be updated
      d3.select(mainWrapperRef.current!).call(
        d3.zoom<HTMLDivElement, any>().transform,
        d3.zoomIdentity
          .translate(transformation.x, transformation.y)
          .scale(transformation.k)
      );
      setTransform(transformation);
    },
    []
  );

  useEffect(() => {
    if (!autoLayout) {
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;

      onZoom({ ...INITIAL_TRANSFORM, x: width / 2, y: height / 2 });
    } else {
      onZoom(INITIAL_TRANSFORM);
    }
  }, [autoLayout, onZoom]);

  const fitContent = useCallback(
    (
      nodesForFitting: d3.Selection<
        Element,
        Node & T,
        HTMLDivElement | null,
        unknown
      >
    ) => {
      if (mainWrapperRef.current) {
        setIsFittingContent(true);
        const newZoom = getFitContentXYK<T>(
          nodesForFitting,
          mainWrapperRef.current.clientWidth,
          mainWrapperRef.current.clientHeight
        );
        if (newZoom) {
          onZoom(newZoom);
        }
        setIsFittingContent(false);
      }
    },
    [onZoom]
  );

  const layoutWithElk = useCallback(() => {
    (async () => {
      if (autoLayout) {
        setIsAutoLayouting(true);
        const nodesWithAutolayoutLocation = await getELKNodes(
          nodes.map((node) => ({ ...node, ...autoLayout(node) })),
          propsLinks
        );
        setNodes((prevNodes) => {
          const newNodes = prevNodes.map((el) => {
            return {
              ...el,
              ...nodesWithAutolayoutLocation.find((n) => n.id === el.id),
            };
          }) as (Node & T)[];

          const newD3Nodes = d3
            .select(containerRef.current)
            .selectAll<Element, Node & T>('div.node')
            .data(newNodes, (_, index) => newNodes[index].id);

          setD3Nodes(newD3Nodes);
          fitContent(newD3Nodes);
          return newNodes;
        });
        setIsAutoLayouting(false);
      }
    })();
  }, [nodes, propsLinks, autoLayout, fitContent]);

  // Zoom callbacks
  useEffect(() => {
    if (mainWrapperRef.current) {
      const zoom = d3
        .zoom<HTMLDivElement, any>()
        .scaleExtent([MIN_ZOOM, MAX_ZOOM])
        .on('zoom', (event) => {
          setTransform(event.transform);
        });
      d3.select(mainWrapperRef.current).call(zoom);
    }
  }, [ticked]);

  // Hover callbacks
  useEffect(() => {
    if (d3Links && onLinkEvent) {
      d3Links
        .on('mouseover', (event) => {
          onLinkEvent('mouseover', event.target.__data__, event);
        })
        .on('mouseout', (event) => {
          onLinkEvent('mouseout', event.target.__data__, event);
        })
        .on('click', (event) => {
          onLinkEvent('click', event.target.__data__, event);
        });
    }
  }, [d3Links, onLinkEvent]);

  // Load data into d3 nodes
  useEffect(() => {
    if (chart && mainWrapperRef.current && nodes.length !== 0) {
      // Create links
      const newD3Lines = chart
        .select('g.links')
        .selectAll<Element, SimulationLinkDatum<Node & T>>('.path')
        .data(links, (_, index) => {
          if (links[index]) {
            return getLinkId(links[index]);
          }
          return '-1';
        });

      // d3 typings are strange
      setD3Links(newD3Lines as any);

      // Creating nodes
      const newD3Nodes = d3
        .select(containerRef.current)
        .selectAll<Element, Node & T>('div.node')
        .data(nodes, (_, index) => nodes[index].id);

      setD3Nodes(newD3Nodes);

      // if autolayout is on
      if (autoLayout) {
        // if we do not have fixed position for every node (some nodes are new)
        if (nodes.some((el) => !el.fx)) {
          layoutWithElk();
        } else {
          fitContent(newD3Nodes);
        }
      }
    }
  }, [
    chart,
    links,
    nodes,
    mainWrapperRef,
    autoLayout,
    fitContent,
    layoutWithElk,
  ]);

  // Set up simulation with node and links
  useEffect(() => {
    if (simulation) {
      simulation.nodes(nodes);
      simulation
        .force('link', d3.forceLink(links).distance(120))
        .force('charge', d3.forceManyBody().strength(20))
        .force('x', d3.forceX().strength(0.05))
        .force('y', d3.forceY().strength(0.05))
        .force('collide', d3.forceCollide().radius(120));
      if (autoLayout) {
        simulation.alphaTarget(0).stop();
      }
    }
  }, [simulation, links, nodes, autoLayout]);

  // Update tick function
  useEffect(() => {
    if (simulation) {
      simulation.on('tick', ticked);
    }
  }, [simulation, ticked]);

  useEffect(() => {
    if (nodes && d3Nodes && simulation) {
      const dragStart = (_event: { active: any }, d: any) => {
        simulation.alphaTarget(ALPHA_ANIMATING_LIMIT).restart();
        d.fx = d.x;
        d.fy = d.y;
      };

      const drag = (event: { dx: any; dy: any }, d: any) => {
        d.fx += event.dx / transform.k;
        d.fy += event.dy / transform.k;

        // This is a work around, enforce a rerender for the nodesChildren, which watches transform.
        setTransform((oldTransform) => ({ ...oldTransform }));
      };

      const dragEnd = (event: { active: any }, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = d.x;
        d.fy = d.y;
        if (useCache) {
          saveToCache(autoLayout ? getNodesKey(nodes) : DEFAULT_KEY, nodes);
        }
      };
      d3Nodes.on('click', () => {
        if (useCache) {
          saveToCache(autoLayout ? getNodesKey(nodes) : DEFAULT_KEY, nodes);
        }
      });
      d3Nodes.call(
        d3
          .drag<any, any>()
          .on('start', dragStart)
          .on('drag', drag)
          .on('end', dragEnd)
      );
    }
  }, [nodes, d3Nodes, simulation, transform.k, autoLayout, useCache]);

  useImperativeHandle(ref, () => ({
    zoomIn: (scaleFactor = 1.1) => {
      const newScaleK = transform.k * scaleFactor;
      onZoom({
        ...transform,
        k: newScaleK < MAX_ZOOM ? newScaleK : MAX_ZOOM,
      });
    },
    zoomOut: (scaleFactor = 1.1) => {
      const newScaleK = transform.k / scaleFactor;
      onZoom({
        ...transform,
        k: newScaleK > MIN_ZOOM ? newScaleK : MIN_ZOOM,
      });
    },
    fitContent: () => fitContent(d3Nodes!),
    forceRerender: () => {
      ticked();
    },
  }));

  return (
    <Wrapper
      {...htmlProps}
      ref={mainWrapperRef}
      data-cy="visualizer_graph_wrapper"
    >
      <div className="node-container" ref={containerRef}>
        <svg className="chart" ref={svgRef}>
          {additionalSvgDefs}
          <g className="links">{linksChildren}</g>
        </svg>
        {nodeChildren}
      </div>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  cursor: grab;

  svg,
  .node-container,
  .chart {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: visible;
  }
  .node {
    position: absolute;
    cursor: pointer;
  }

  .chart path {
    stroke: var(--cogs-greyscale-grey6);
    fill: none;
    stroke-width: 1px;
  }
  .invisible {
    visibility: hidden;
  }
  .hidden {
    display: none;
  }
`;
