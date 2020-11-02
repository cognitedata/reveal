import TreeView from 'src/pages/RevisionDetails/components/TreeView/TreeView';
import React, { useEffect, useRef, useState } from 'react';
import { CheckInfo } from 'src/pages/RevisionDetails/components/TreeView/types';
import { Cognite3DModel } from '@cognite/reveal';
import { fireErrorNotification } from 'src/utils';
import debounce from 'lodash/debounce';

type Props = {
  model: Cognite3DModel;
  width: number;
  style?: React.CSSProperties;
};

export function ToolbarTreeView(props: Props) {
  const treeViewContainer = useRef<HTMLDivElement>(null);
  const [treeViewHeight, setTreeViewHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (treeViewContainer.current) {
        setTreeViewHeight(
          treeViewContainer.current.getBoundingClientRect().height
        );
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onCheck = debounce((checkedKeys: Array<number>, _info: CheckInfo) => {
    props.model.hideAllNodes();
    checkedKeys.forEach((key) => {
      props.model.showNodeByTreeIndex(key, true);
    });
  }, 250);

  const onError = (error: Error) => {
    return fireErrorNotification({
      message: error.message,
    });
  };

  return (
    <div
      style={{
        flexGrow: 1,
        overflowY: 'hidden',
        ...props.style,
      }}
      ref={treeViewContainer}
    >
      <TreeView
        width={props.width}
        height={treeViewHeight}
        modelId={props.model.modelId}
        revisionId={props.model.revisionId}
        onCheck={onCheck as any}
        onError={onError}
      />
    </div>
  );
}
