import { useMemo } from 'react';

import styled from 'styled-components';

import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { CommentTooltip } from '../components/tooltips/CommentTooltip';
import type { Comment } from '../services/comments/types';
import { CommentAnnotation } from '../types';

export type UseCommentTooltipsParams = {
  comments: Comment[];
  commentAnnotations: CommentAnnotation[];
};

const useCommentTooltips = ({
  comments,
  commentAnnotations,
}: UseCommentTooltipsParams) => {
  return useMemo(() => {
    if (commentAnnotations === undefined) {
      return [];
    }

    return commentAnnotations.map((annotation) => {
      return {
        targetId: String(annotation.id),
        content: (
          <BottomMarginStyle>
            <CommentTooltip
              comments={comments.filter(
                (comment) => comment.parentComment?.externalId === annotation.id
              )}
              comment={annotation}
            />
          </BottomMarginStyle>
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      };
    });
  }, [comments, commentAnnotations]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCommentTooltips;
