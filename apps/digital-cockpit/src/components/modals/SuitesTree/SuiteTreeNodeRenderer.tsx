import { CustomRendererProps } from 'react-virtualized-tree';
import { useEffect } from 'react';
import { Radio } from '@cognite/cogs.js';

import { TREE_UPDATE_TYPE } from './types';

const TreeNodeRenderer = ({
  node,
  onChange: handleOnChange,
  measure,
}: CustomRendererProps<any>) => {
  useEffect(() => {
    measure();
  }, []);
  return (
    <div>
      <Radio
        name="suiteKey"
        key={node.id}
        value={node.id}
        checked={node.state?.selected}
        disabled={node.state?.disabled}
        onChange={() =>
          handleOnChange({
            node,
            type: `${TREE_UPDATE_TYPE.SELECT}`,
          })
        }
      >
        {node.name}
      </Radio>
    </div>
  );
};

export default TreeNodeRenderer;
