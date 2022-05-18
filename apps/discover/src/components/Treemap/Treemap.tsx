import { useEffect, useRef } from 'react';

import { select, hierarchy, treemap } from 'd3';

import { useDebounce } from 'hooks/useDebounce';

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
  onTileClicked?: (data: TreeMapData) => void;
}

export const Treemap: React.FC<Props> = ({ data, onTileClicked }) => {
  const divRef = useRef<HTMLDivElement>(null);

  const renderTreemap = () => {
    const rootDiv = select(divRef.current);

    const root = hierarchy(data)
      .sum((data) => data.value || 0)
      .sort(
        (node1, node2) => (node2.data.value || 0) - (node1.data.value || 0)
      );

    const treemapRoot = treemap<TreeMapData>()
      .size([
        rootDiv.node()?.getBoundingClientRect().width || 0,
        rootDiv.node()?.getBoundingClientRect().height || 0,
      ])
      .padding(4)(root);

    rootDiv.selectAll('.node').remove();

    const nodes = rootDiv
      .selectAll('.node')
      .data(treemapRoot.leaves())
      .enter()
      .append('div')
      .on('click', (_event, node) => {
        if (onTileClicked) {
          onTileClicked(node.data);
        }
      })
      .attr('class', 'node rect')
      .style('left', (node) => `${node.x0}px`)
      .style('top', (node) => `${node.y0}px`)
      .style('width', (node) => `${node.x1 - node.x0}px`)
      .style('height', (node) => `${node.y1 - node.y0}px`)
      .style('position', 'absolute');

    // // title
    nodes
      .append('p')
      .text((node) => `${node.data?.title || ''}`)
      .attr('class', 'title-text');

    // description
    nodes
      .append('p')
      .text((node) => `${node.data?.description || ''}`)
      .attr('class', 'description-text');
  };

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

  return <TreemapWrapper ref={divRef} />;
};
