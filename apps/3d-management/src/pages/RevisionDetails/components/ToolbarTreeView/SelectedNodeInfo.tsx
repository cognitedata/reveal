import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { selectNodes } from 'src/store/modules/TreeView';

const RootContainer = styled.div`
  background: #eee;
  width: 100%;
  height: 28px;
  line-height: 28px;
  border-radius: 4px;
`;

const TextBtn = styled.span`
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    font-weight: bolder;
  }
`;

export function SelectedNodeInfo(props: { style?: React.CSSProperties }) {
  const selectedNodesAmount = useSelector((app: RootState) => {
    return app.treeView.selectedNodes.length;
  });

  const dispatch = useDispatch();

  const strNodesSelected = `${selectedNodesAmount} ${
    selectedNodesAmount > 1 ? 'nodes' : 'node'
  } selected. `;

  return (
    <RootContainer style={props.style}>
      {selectedNodesAmount ? (
        <>
          {strNodesSelected}
          <TextBtn onClick={() => dispatch(selectNodes([]))}>
            Clear selection
          </TextBtn>
        </>
      ) : null}
    </RootContainer>
  );
}
