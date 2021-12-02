import * as d3 from 'd3'; // We should fix this, we should import only the things we need

/* eslint-disable */
class CogGraph extends HTMLElement {
  private root;
  private svgRef: HTMLDivElement;
  private nodeChildren: HTMLDivElement;
  private nodes: any[];
  private links: any[];
  private _options = {} as any;

  constructor() {
    super();
    // this.root = this.getRootNode() as any;
    this.root = this.attachShadow({ mode: 'open' });

    this.root.innerHTML = `
    <div id="elRoot">
<svg width="960" height="600"></svg>
<div id="nodeChildren"></div>
    </div>
    <style>
    .link {
      fill: none;
      stroke: #666;
      stroke-width: 1.5px;
    }

    .node circle {
      fill: #ccc;
      stroke: #fff;
      stroke-width: 1.5px;
    }

    text {
      font: 10px sans-serif;
      pointer-events: none;
    }

    .links line {
      stroke: #aaa;
    }

    .nodes circle {
      pointer-events: all;
      stroke: none;
      stroke-width: 40px;
    }

    :host #mainWrapperRef {

      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border: 1px solid #333333;
    }

    :host #mainWrapperRef canvas,
    :host #mainWrapperRef node-container {
      cursor: grab;
    }

    :host .node {
      position: absolute;
      cursor: pointer;
    }

    :host .chart line {
      stroke: #ccc;
      stroke-width: 1px;
    }
    :host .chart path {
      stroke: #ccc;
      fill: none;
      stroke-width: 1px;
    }

    .test-node {
      padding: 25px 20px;
      width: 80px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 50%;
      /*transform: translate(-50%, -50%);*/
    }
    </style>`;

    this.svgRef = this.root.querySelector('svg') as any;
    this.nodeChildren = this.root.querySelector('#nodeChildren') as any;
    this.nodes = [];
    this.links = [];
  }

  get options() {
    return this._options;
  }

  set options(newValue: any) {
    this._options = newValue;
    this.render();
  }

  private render() {
    // const data = {
    //   nodes: [
    //     { name: 'd3' },
    //     { name: 'd3.svg' },
    //     { name: 'd3.svg.area' },
    //     { name: 'd3.svg.line' },
    //     { name: 'd3.scale' },
    //     { name: 'd3.scale.linear' },
    //     { name: 'd3.scale.ordinal' },
    //   ],
    //   links: [
    //     { source: 0, target: 1 },
    //     { source: 1, target: 2 },
    //     { source: 1, target: 3 },
    //     { source: 0, target: 4 },
    //     { source: 4, target: 5 },
    //     { source: 4, target: 6 },
    //   ],
    // };
    // const data = mockDataSvg;
    const nodes = [
      {
        id: '0',
        title: 'Movie',
      },
      {
        id: '1',
        title: 'Actor',
      },
    ];

    const links = [
      {
        source: nodes[0].id,
        target: nodes[1].id,
      },
    ];

    this.nodes = nodes;
    this.links = links;

    //Creating nodes
    // const nodes = d3
    // .select(containerRef.current)
    // .selectAll('div.node')
    // .data(nodes, (_: any, index) => {
    //   return nodes[index].id;
    // });

    this.nodeChildren.append(...this.renderNodeChildren());
    var svg = d3.select(this.svgRef).attr('width', 960).attr('height', 600);
    // var svg = d3.select('svg');
    var width = 960;
    var height = 600;

    var simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().distance(100))
      .force(
        'charge',
        d3.forceManyBody().strength(() => -60)
      )
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .force('collide', d3.forceCollide())
      .on('tick', ticked);

    var link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line');

    var node = d3
      .select(this.nodeChildren)
      .selectAll('div.test-node')
      .data(this.nodes, (_, index) => this.nodes[index].id);

    // var node = svg
    //   .append('g')
    //   .attr('class', 'nodes')
    //   .selectAll('circle')
    //   .data(nodes)
    //   .enter()
    //   .append('circle')
    //   .attr('r', 2.5);
    // .call(
    //   (d3 as any)
    //     .drag()
    //     .on('start', dragstarted)
    //     .on('drag', dragged)
    //     .on('end', dragended)
    // );

    node.append('title').text(function (d: any) {
      return d.id;
    });

    // d3.select(this.svgRef).call(
    //   d3
    //     .drag<any, any>()
    //     .container(this.svgRef)
    //     .subject(dragsubject)
    //     .on('start', dragstarted)
    //     .on('drag', dragged)
    //     .on('end', dragended)
    // );

    var tmpLocationStore = {};
    var transform;
    const dragStart = (_event: { active: any }, d: any) => {
      console.log('saf');
      simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      console.log(d);
      // tmpLocationStore[d.id] = { ...d };
    };

    const drag = (event: { dx: any; dy: any }, d: any) => {
      d.fx += event.dx;
      d.fy += event.dy;
      // This is a work around, enforce a rerender for the nodesChildren, which watches transform.
      // setTransform((oldTransform) => ({ ...oldTransform }));
      // transform = { ...this.transform };
    };

    const dragEnd = (event: { active: any }, d: any) => {
      if (!event.active) simulation.alphaTarget(0);
      // if (useFixedNodes) {
      //   // addFixedNode.mutate({ id: d.id, x: d.fx, y: d.fy });
      // }

      // d.fx = null;
      // d.fy = null;
    };

    node.call(
      d3
        .drag<any, any>()
        .on('start', dragStart)
        .on('drag', drag)
        .on('end', dragEnd)
    );

    function dragsubject(event: { active: any; x: number; y: number }, d: any) {
      console.log(event, d);
      return simulation.find(event.x - width / 2, event.y - height / 2);
    }

    function dragstarted(_event: { active: any; subject: any }, d: any) {
      // if (!(d3 as any).event.active) simulation.alphaTarget(0.3).restart();
      // (d3 as any).event.subject.fx = (d3 as any).event.subject.x;
      // (d3 as any).event.subject.fy = (d3 as any).event.subject.y;
      simulation.alphaTarget(0.3).restart();
      _event.subject.fx = _event.subject.x;
      _event.subject.fy = _event.subject.y;
    }

    function dragged(event: { dx: any; dy: any; subject: any }, d: any) {
      // (d3 as any).event.subject.fx = (d3 as any).event.x;
      // (d3 as any).event.subject.fy = (d3 as any).event.y;
      event.subject.fx += event.dx;
      event.subject.fy += event.dy;
    }

    function dragended(event: { active: any; fx: any; fy: any }, d: any) {
      // if (!(d3 as any).event.active) simulation.alphaTarget(0);
      // (d3 as any).event.subject.fx = null;
      // (d3 as any).event.subject.fy = null;
      if (!event.active) simulation.alphaTarget(0);
      event.fx = null;
      event.fy = null;
    }

    simulation.nodes(nodes as any);

    // (simulation.force('link') as any).links(data.links);

    function ticked() {
      link
        .attr('x1', function (d: any) {
          return d.source.x;
        })
        .attr('y1', function (d: any) {
          return d.source.y;
        })
        .attr('x2', function (d: any) {
          return d.target.x;
        })
        .attr('y2', function (d: any) {
          return d.target.y;
        });

      node.attr('style', (d: any) => {
        const nodeX = 100 + d.x; // x + k * d.x;
        const nodeY = 100 + d.y; //y + k * d.y;
        return `position:absolute; left: ${nodeX}px; top: ${nodeY}px`;
      });
      // node
      //   .attr('cx', function (d: any) {
      //     return d.x;
      //   })
      //   .attr('cy', function (d: any) {
      //     return d.y;
      //   });
    }

    // function dragstarted(d: any) {
    //   if (!(d3 as any).event.active) simulation.alphaTarget(0.3).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }

    // function dragged(d: any) {
    //   d.fx = (d3 as any).event.x;
    //   d.fy = (d3 as any).event.y;
    // }

    // function dragended(d: any) {
    //   if (!(d3 as any).event.active) simulation.alphaTarget(0);
    //   d.fx = null;
    //   d.fy = null;
    // }
  }

  private renderNodeChildren() {
    const els = this.nodes.map((node) => {
      let el;
      if (this._options && this._options.renderNode) {
        el = this.options.renderNode(node);
      } else {
        el = document.createElement('div');
        el.id = node.id;
      }
      return el;
    });
    return els as Node[];
  }
}

export const enableGraphElement = () => {
  window.customElements.define('cog-graph', CogGraph);
};
