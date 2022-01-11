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
import { Spinner } from '../Spinner/Spinner';

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
}: GraphProps<T>) => {
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

  const [isLoading, setLoading] = useState<boolean>(autoLayout);
  const [nodes, setNodes] = useState<(Node & T)[]>(propsNodes);

  useEffect(() => {
    setNodes(propsNodes);
    if (autoLayout) {
      setLoading(true);
    }
  }, [propsNodes, autoLayout]);

  useEffect(() => {
    (async () => {
      if (isLoading && d3Nodes) {
        const nodesForRendering = await getELKNodes(
          d3Nodes.nodes() as (Element & { __data__: Node })[],
          propsLinks
        );
        setNodes(
          propsNodes.map((el) => {
            return {
              ...el,
              ...nodesForRendering.find((n) => n.id === el.id),
            };
          }) as (Node & T)[]
        );
        setLoading(false);
      }
    })();
  }, [isLoading, nodes, d3Nodes, propsNodes, propsLinks]);

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

  const [transform, setTransform] = useState<{
    k: number;
    x: number;
    y: number;
  }>({ k: 1, x: 0, y: 0 });

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

  const onZoom = (transformation: { k: number; x: number; y: number }) => {
    // this is called because d3 keeps internal state with "d3.zoom" which needs to be updated
    d3.select(mainWrapperRef.current!).call(
      d3.zoom<HTMLDivElement, any>().transform,
      d3.zoomIdentity
        .translate(transformation.x, transformation.y)
        .scale(transformation.k)
    );
    setTransform(transformation);
    ticked(transformation);
  };

  useEffect(() => {
    if (mainWrapperRef.current) {
      const zoom = d3
        .zoom<HTMLDivElement, any>()
        .scaleExtent([MIN_ZOOM, MAX_ZOOM])
        .on('zoom', (event) => {
          setTransform(event.transform);
          ticked(event.transform);
        });
      d3.select(mainWrapperRef.current).call(zoom);
    }
  }, [ticked]);

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

  useEffect(() => {
    if (chart) {
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
  }, [chart, links, nodes]);

  useEffect(() => {
    if (simulation) {
      // Starting simulation
      simulation.nodes(nodes).on('tick', ticked);
      simulation.force('link', d3.forceLink(links));
    }
  }, [simulation, links, nodes, ticked]);

  useEffect(() => {
    if (d3Nodes && simulation) {
      const { k } = transform;
      const dragStart = (_event: { active: any }, d: any) => {
        simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      };

      const drag = (event: { dx: any; dy: any }, d: any) => {
        d.fx += event.dx / k;
        d.fy += event.dy / k;
        // This is a work around, enforce a rerender for the nodesChildren, which watches transform.
        setTransform((oldTransform) => ({ ...oldTransform }));
      };

      const dragEnd = (event: { active: any }, _d: any) => {
        if (!event.active) simulation.alphaTarget(0);
      };
      d3Nodes.call(
        d3
          .drag<any, any>()
          .on('start', dragStart)
          .on('drag', drag)
          .on('end', dragEnd)
      );
    }
  }, [d3Nodes, simulation, transform]);

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
    fitContent: () => {
      if (d3Nodes) {
        const initialNodes = d3Nodes.nodes().map((node: any) => ({
          id: node.id,
          width: node.clientWidth,
          height: node.clientHeight,
          x: node.__data__.x,
          y: node.__data__.y,
        }));

        if (mainWrapperRef.current) {
          const width = mainWrapperRef.current.clientWidth;
          const height = mainWrapperRef.current.clientHeight;

          // sort the nodes by x from lowest to highest
          initialNodes.sort((a, b) => a.x - b.x);
          const minXNode = initialNodes[0]; // left most node
          const maxXNode = initialNodes[initialNodes.length - 1]; // right most node

          // sort the nodes by y from lowest to highest
          initialNodes.sort((a, b) => a.y - b.y);
          const minYNode = initialNodes[0]; // top node
          const maxYNode = initialNodes[initialNodes.length - 1]; // bottom node

          const newX = -minXNode.x; // move backwards by x to origin
          const newY = -minYNode.y; // move backwards by y to origin

          // since the box's width/height is not "scaling" when zooming in/out, avoid it in the scale calculation
          // scale => bounding box of the nodes / viewport width - max node's width
          const scaleX = (maxXNode.x - minXNode.x) / (width - maxXNode.width);
          // scale => bounding box of the nodes / viewport height - max node's height
          const scaleY = (maxYNode.y - minYNode.y) / (height - maxYNode.height);

          // take the max of the scales
          const scaleK = Math.max(scaleX, scaleY);

          // set zoom
          onZoom({
            x: newX / scaleK,
            y: newY / scaleK,
            k: 1 / scaleK,
          });
        }
      }
    },
    forceRerender: () => {
      ticked();
    },
  }));

  return (
    <Wrapper ref={mainWrapperRef}>
      {isLoading && <Spinner style={{ position: 'absolute' }} />}
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
  position: relative;

  svg,
  .node-container {
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
