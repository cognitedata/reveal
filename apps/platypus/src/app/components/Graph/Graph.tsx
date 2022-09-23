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
import { getELKNodes } from './layout/elkLayout';
import { getFitContentXYK } from './layout/fitLayout';
import { HtmlElementProps } from '@platypus-app/types';
import { loadFromCache, saveToCache } from './cache';

export type Node = SimulationNodeDatum & {
  id: string;
  title: string;
};
export type Link = { source: string; target: string };

const getMidPoint = (x = 0, y = 0) => (x + y) / 2;

export const getLinkId = (link: SimulationLinkDatum<Node>) => {
  const fromId = (link.source as Node).id
    ? (link.source as Node).id
    : link.source;
  const toId = (link.target as Node).id
    ? (link.target as Node).id
    : link.target;
  return `${fromId}-${toId}`;
};

const HALF_PIN_WIDTH = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 100;
export interface GraphProps<T> {
  renderNode: (
    item: Node & T,
    transform: { x: number; y: number; k: number },
    nodes:
      | (d3.SimulationNodeDatum & {
          id: string;
          title: string;
        } & T)[]
      | undefined
  ) => React.ReactElement<{ id: string }>;
  renderLink?: (
    item: SimulationLinkDatum<Node & T>,
    transform: { x: number; y: number; k: number },
    nodes:
      | (d3.SimulationNodeDatum & {
          id: string;
          title: string;
        } & T)[]
      | undefined
  ) => React.ReactElement<{ id: string }>;
  nodes: (Node & T)[];
  links: Link[];
  useCurve?: boolean;
  children?: React.ReactNode;
  initialZoom?: number;
  autoLayout?: boolean;
  getOffset?: GetOffsetFunction<T>;
  graphRef?: React.Ref<GraphFns>;
  onLinkEvent?: (
    type: 'mouseover' | 'mouseout' | 'click',
    data: SimulationLinkDatum<Node & T>,
    origEvent: any
  ) => void;
  onLoadingStatus?: (isLoaded: boolean) => void;
}

export type GetOffsetFunction<T> = (link: SimulationLinkDatum<Node & T>) => {
  source: { x: number; y: number };
  target: { x: number; y: number };
};

const defaultGetOffset = () => ({
  source: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
});

const defaultRenderLink = (el: SimulationLinkDatum<Node>) => {
  const id = getLinkId(el);
  return <path className="line" key={id} id={id} />;
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
  initialZoom = 5,
  autoLayout = true,
  getOffset = defaultGetOffset,
  onLinkEvent,
  children,
  graphRef: ref,
  onLoadingStatus,
  ...htmlProps
}: GraphProps<T> & HtmlElementProps<HTMLDivElement>) => {
  // where the lines are drawn
  const svgRef = useRef<SVGSVGElement | null>(null);

  // where the nodes are drawn
  const containerRef = useRef<HTMLDivElement | null>(null);

  // where both the lines and nodes div live within (the container)
  const mainWrapperRef = useRef<HTMLDivElement | null>(null);

  // broader d3 controller for behavior
  const [chart, setChart] = useState<
    d3.Selection<SVGSVGElement, any, null, undefined> | undefined
  >(undefined);

  // physics engine for moving nodes around
  const [simulation, setSimulation] = useState<
    d3.Simulation<SimulationNodeDatum, undefined> | undefined
  >(undefined);

  // all of the lines
  const [d3Links, setD3Links] = useState<
    | d3.Selection<Element, SimulationLinkDatum<Node & T>, Element, any>
    | undefined
  >(undefined);

  // all of the nodes
  const [d3Nodes, setD3Nodes] = useState<
    d3.Selection<Element, Node & T, HTMLDivElement | null, unknown> | undefined
  >(undefined);

  const [isFittingContent, setFittingContent] = useState<boolean>(true);
  const [isAutoLayouting, setIsAutoLayouting] = useState<boolean>(false);
  const [nodes, setNodes] = useState<(Node & T)[]>([]);

  const [transform, setTransform] = useState<{
    k: number;
    x: number;
    y: number;
  }>({ k: 1, x: 0, y: 0 });

  const isLoading = isFittingContent || isAutoLayouting;

  useEffect(() => {
    if (onLoadingStatus) {
      onLoadingStatus(!isLoading);
    }
  }, [onLoadingStatus, isLoading]);

  useEffect(() => {
    const cacheItems = loadFromCache(propsNodes);
    const nodesWithCachedLocation = propsNodes.map((node) => ({
      ...cacheItems[node.id],
      ...node,
    }));
    setNodes(nodesWithCachedLocation);
    if (
      autoLayout &&
      nodesWithCachedLocation.length !== 0 &&
      nodesWithCachedLocation.some((el) => !el.fx || !el.fy)
    ) {
      setIsAutoLayouting(true);
    }
    setFittingContent(true);
  }, [propsNodes, autoLayout]);

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
            source: nodeById[link.source],
            target: nodeById[link.target],
          } as SimulationLinkDatum<Node & T>)
      )
      .filter((el) => el.source && el.target);
    return newLinks;
  }, [nodes, propsLinks]);

  const nodeChildren = useMemo(
    () =>
      nodes.map((el) => (
        <div className="node" key={el.id} id={el.id}>
          {renderNode(el, transform, d3Nodes?.data())}
        </div>
      )),
    [d3Nodes, nodes, renderNode, transform]
  );

  const linksChildren = useMemo(
    () => links.map((el) => renderLink(el, transform, d3Nodes?.data())),
    [d3Nodes, links, renderLink, transform]
  );

  useEffect(() => {
    if (!mainWrapperRef.current || !containerRef.current || !svgRef.current) {
      return;
    }
    // Initializing chart
    const initialChart = d3.select(svgRef.current);

    const initialSimulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().distance(100))
      .force(
        'charge',
        d3.forceManyBody().strength(() => -60)
      )
      .force('collide', d3.forceCollide());

    setChart(initialChart);
    setSimulation(initialSimulation);
  }, [initialZoom]);

  // Setting location when ticked
  const ticked = useCallback(
    // global transform values
    ({ x, y, k }: { x: number; y: number; k: number } = transform) => {
      // determine the amount to scale the node versus wrapper
      // behavior: if zoomed out more than original, scale wrapper
      // other wise, scale the distance between nodes
      const nodeScale = Math.max(k, 1);
      const wrapperScale = Math.min(k, 1);

      if (d3Links && d3Nodes) {
        // fns to get the transformed locations of source/targets
        const getSourceX = (d: SimulationLinkDatum<Node & T>) =>
          x / wrapperScale +
          nodeScale * (d.source as Node).x! +
          getOffset(d).source.x;
        const getSourceY = (d: SimulationLinkDatum<Node & T>) =>
          y / wrapperScale +
          nodeScale * (d.source as Node).y! +
          getOffset(d).source.y;
        const getTargetX = (d: SimulationLinkDatum<Node & T>) =>
          x / wrapperScale +
          nodeScale * (d.target as Node).x! +
          getOffset(d).target.x;
        const getTargetY = (d: SimulationLinkDatum<Node & T>) =>
          y / wrapperScale +
          nodeScale * (d.target as Node).y! +
          getOffset(d).target.y;

        // transform the links (if its curve vs line)
        d3Links.attr('d', (d: SimulationLinkDatum<Node & T>) => {
          if (!d.source && !d.target) {
            return '';
          }
          const midXY = {
            x: getMidPoint(getTargetX(d), getSourceX(d)),
            y: getMidPoint(getTargetY(d), getSourceY(d)),
          };
          let curve: (string | number)[] = [
            'M',
            `${getSourceX(d)}, ${getSourceY(d)}`,
            'L',
            `${getTargetX(d)}, ${getTargetY(d)}`,
          ];
          if (useCurve) {
            curve = [
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
            ];
          }
          return curve.join(' ');
        });
        // transform the nodes
        d3Nodes.attr('style', (d: any) => {
          const nodeX = x / wrapperScale + nodeScale * d.x;
          const nodeY = y / wrapperScale + nodeScale * d.y;
          return `left: ${nodeX}px; top: ${nodeY}px`;
        });
        if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          // scale relative to the center to zoom around the x, y
          const preTransform = `translate(-${width / 2}px,-${height / 2}px)`;
          const postTransform = `translate(${width / 2}px,${height / 2}px)`;
          containerRef.current!.style.transform = `${preTransform} scale(${wrapperScale}) ${postTransform}`;
        }
      }
    },
    [d3Nodes, d3Links, transform, useCurve, getOffset, containerRef]
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
    if (chart && mainWrapperRef.current) {
      // Create links
      const newD3Lines = chart
        .select('g.links')
        .selectAll<Element, SimulationLinkDatum<Node & T>>('.line')
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
    }
  }, [chart, links, nodes, mainWrapperRef]);

  // Set up simulation with node and links
  useEffect(() => {
    if (simulation) {
      simulation.nodes(nodes);
      simulation.force('link', d3.forceLink(links));
    }
  }, [simulation, links, nodes]);

  // Update tick function
  useEffect(() => {
    if (simulation) {
      simulation.on('tick', ticked);
    }
  }, [simulation, ticked]);

  useEffect(() => {
    if (nodes && d3Nodes && simulation) {
      const dragStart = (_event: { active: any }, d: any) => {
        simulation.alphaTarget(0.3).restart();
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
        saveToCache(nodes, d.id, d.fx, d.fy);
      };
      d3Nodes.call(
        d3
          .drag<any, any>()
          .on('start', dragStart)
          .on('drag', drag)
          .on('end', dragEnd)
      );
    }
  }, [nodes, d3Nodes, simulation, transform.k]);

  const fitContent = useCallback(() => {
    if (d3Nodes && mainWrapperRef.current) {
      const newZoom = getFitContentXYK<T>(
        d3Nodes,
        mainWrapperRef.current.clientWidth,
        mainWrapperRef.current.clientHeight
      );
      if (newZoom) {
        onZoom(newZoom);
      }
    }
  }, [d3Nodes, onZoom]);

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
    fitContent,
    forceRerender: () => {
      ticked();
    },
  }));

  // Do an auto fit if it is loading...
  useEffect(() => {
    (async () => {
      if (isAutoLayouting && d3Nodes) {
        const nodesForRendering = await getELKNodes(
          d3Nodes.nodes() as (Element & { __data__: Node })[],
          propsLinks
        );
        setNodes(
          (prevNodes) =>
            prevNodes.map((el) => {
              return {
                ...el,
                ...nodesForRendering.find((n) => n.id === el.id),
              };
            }) as (Node & T)[]
        );
        setIsAutoLayouting(false);
        setFittingContent(true);
      }
    })();
  }, [isAutoLayouting, d3Nodes, propsLinks, onZoom]);

  useEffect(() => {
    if (!isAutoLayouting && isFittingContent) {
      try {
        fitContent();
        setTimeout(() => setFittingContent(false), 300);
      } catch {
        // TODO sentry error
      }
    }
  }, [isFittingContent, isAutoLayouting, fitContent]);

  return (
    <Wrapper {...htmlProps} ref={mainWrapperRef}>
      <div className="node-container" ref={containerRef}>
        <svg className="chart" ref={svgRef}>
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

  svg,
  .node-container,
  .chart {
    cursor: grab;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: visible;
  }
  .node {
    position: absolute;
    cursor: pointer;
  }

  .chart line {
    stroke: var(--cogs-greyscale-grey6);
    stroke-width: 1px;
  }
  .chart path {
    stroke: var(--cogs-greyscale-grey6);
    fill: none;
    stroke-width: 1px;
  }
`;
