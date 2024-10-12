/*!
 * Copyright 2023 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, type RefObject, useEffect, useState, useRef } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { getChildrenAsArray, TreeViewNode } from './TreeViewNode';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useRefDimensions = (ref: RefObject<HTMLDivElement>, counter: number) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const { current } = ref;
    if (current !== null) {
      const boundingRect = current.getBoundingClientRect();
      if (current.parentElement !== null) {
        const d = current.getBoundingClientRect();
        const { width, height } = d;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    }
  }, [ref, counter]);
  return dimensions;
};

const BACKGROUND_COLOR = 'white';

export const TreeView = (props: TreeViewProps): ReactElement => {
  // const htmlRef = useRef<HTMLDivElement>(null);
  // const [updateCounter, setUpdateCounter] = useState(-1);
  // const s = useRefDimensions(htmlRef, counter);
  // console.log(s.height, s.width);

  const nodes = getChildrenAsArray(props.root, false);
  if (nodes === undefined) {
    return <></>;
  }
  return (
    <div
      // ref={htmlRef}
      style={{
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR
      }}>
      {nodes.map((node, index) => (
        <TreeViewNode node={node} key={index} level={0} props={props} />
      ))}
    </div>
  );
};
