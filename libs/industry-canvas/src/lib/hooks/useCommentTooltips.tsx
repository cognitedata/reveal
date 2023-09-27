import { useMemo } from 'react';

import styled from 'styled-components';

import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { CommentTooltip } from '../components/tooltips/CommentTooltip';
import { useIndustryCanvasContext } from '../IndustryCanvasContext';
import type { Comment } from '../services/comments/types';
import { useIndustrialCanvasStore } from '../state/useIndustrialCanvasStore';
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
  const pendingComment = useIndustrialCanvasStore(
    (state) => state.pendingComment
  );
  return useMemo(() => {
    if (activeCanvas === undefined || commentAnnotations === undefined) {
      return [];
    }
    const mergedCommentAnnotations =
      pendingComment !== null
        ? [pendingComment, ...commentAnnotations]
        : commentAnnotations;
    return mergedCommentAnnotations.map((annotation) => {
      const parentComment = comments.find(
        (comment) => comment.externalId === annotation.id
      );
      const isPendingComment = annotation.id === pendingComment?.id;
      return {
        targetId: String(annotation.id),
        content:
          parentComment === undefined && !isPendingComment ? (
            <></>
          ) : (
            <BottomMarginStyle>
              <CommentTooltip
                isPendingComment={isPendingComment}
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
  }, [activeCanvas, commentAnnotations, pendingComment, comments]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCommentTooltips;
