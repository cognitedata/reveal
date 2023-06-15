import { useMemo } from 'react';

import styled from 'styled-components';

import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { CommentTooltip } from '../components/tooltips/CommentTooltip';
import { CommentAnnotation } from '../types';

import { useListComments } from './use-query/useListComments';

export type UseCommentTooltipsParams = {
  commentAnnotations: CommentAnnotation[];
};

const useCommentTooltips = ({
  commentAnnotations,
}: UseCommentTooltipsParams) => {
  const { isLoading } = useListComments();
  return useMemo(() => {
    if (commentAnnotations === undefined) {
      return [];
    }

    return commentAnnotations.map((el) => ({
      targetId: String(el.id),
      content: (
        <BottomMarginStyle>
          <CommentTooltip comment={el} />
        </BottomMarginStyle>
      ),
      anchorTo: TooltipAnchorPosition.TOP_RIGHT,
      shouldPositionStrictly: true,
    }));
  }, [commentAnnotations, isLoading]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCommentTooltips;
