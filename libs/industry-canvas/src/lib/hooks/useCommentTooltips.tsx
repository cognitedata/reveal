import { useMemo } from 'react';

import styled from 'styled-components';

import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { CommentTooltip } from '../components/tooltips/CommentTooltip';
import { useIndustryCanvasContext } from '../IndustryCanvasContext';
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
  const { activeCanvas } = useIndustryCanvasContext();
  return useMemo(() => {
    if (activeCanvas === undefined || commentAnnotations === undefined) {
      return [];
    }

    return commentAnnotations.map((annotation) => {
      const parentComment = comments.find(
        (comment) => comment.externalId === annotation.id
      );
      return {
        targetId: String(annotation.id),
        content:
          parentComment === undefined ? (
            <></>
          ) : (
            <BottomMarginStyle>
              <CommentTooltip
                activeCanvas={activeCanvas}
                parentComment={parentComment}
                comments={comments.filter(
                  (comment) =>
                    comment.parentComment?.externalId === annotation.id
                )}
                commentAnnotation={annotation}
              />
            </BottomMarginStyle>
          ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      };
    });
  }, [comments, commentAnnotations, activeCanvas]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCommentTooltips;
