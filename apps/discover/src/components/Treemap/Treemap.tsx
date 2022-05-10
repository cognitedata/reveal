import { useEffect, useRef } from 'react';

import { select, hierarchy, treemap } from 'd3';

import { useDebounce } from '../../hooks/useDebounce';

import { TreemapWrapper } from './elements';

export interface TreeMapData {
  title?: string;
  description?: string;
  children?: TreeMapData[];
  value?: number;
  [key: string]: unknown; // additional props if needed
}

export interface Props {
  data: TreeMapData;
  onTileClicked: (data: TreeMapData) => void;
}

export const Treemap: React.FC<Props> = ({ data, onTileClicked }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  let treemapRoot;

  function renderTreemap() {
    const svg = select(svgRef.current);

    const root = hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.data.value || 0) - (a.data.value || 0));

    treemapRoot = treemap<TreeMapData>()
      .size([
        svgRef?.current?.width.baseVal.value || 0,
        svgRef?.current?.height.baseVal.value || 0,
      ])
      .padding(4)(root);

    const nodes = svg
      .selectAll('g')
      .data(treemapRoot.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // this is used for dynamic coloring of the chart
    // const fader = (color: string | d3.ColorCommonInstance) =>
    //   d3.interpolateRgb(color, '#fff')(0.3);
    // const colorScale = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

    nodes.selectAll('rect').remove();
    nodes.selectAll('text').remove();

    nodes
      .append('rect')
      .on('click', (e, d) => {
        onTileClicked(d.data);
      })
      .attr('class', 'rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('rx', 4);

    // title
    nodes
      .append('text')
      .text((d) => `${d.data?.title || ''}`)
      .attr('class', 'title-text')
      .attr('x', 24)
      .attr('y', 30)
      // .attr('textLength', '100%')
      .attr('lengthAdjust', 'spacing');

    // description

    nodes
      .append('text')
      .text((d) => `${d.data?.description || ''}`)
      .attr('class', 'description-text')
      .attr('x', 24)
      .attr('y', 50);
  }

  useEffect(() => {
    renderTreemap();
  }, [data]);

  const debouncedHandleResize = useDebounce(() => {
    renderTreemap();
  }, 1000);

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  return (
    <TreemapWrapper>
      <svg ref={svgRef} height="100%" width="100%" />
    </TreemapWrapper>
  );
};
