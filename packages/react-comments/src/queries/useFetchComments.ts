import axios from 'axios';
import { useQuery } from 'react-query';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';
import { MessageType } from '@cognite/cogs.js';

import { commentKeys } from './queryKeys';

interface Props {
  serviceUrl: string;
  target: CommentTarget;
}

export const doFetchComments = ({
  headers,
  target,
  serviceUrl,
}: {
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment/list`,
      {
        filter: { target, scope: ['fas-demo'] },
      },
      { headers }
    )
    .then((result) => {
      return normalizeComments(result.data.items);
    });
};

export const useFetchComments = ({ target, serviceUrl }: Props) => {
  const headers = getAuthHeaders({ useIdToken: true });

  return useQuery(commentKeys.thread(target), () =>
    doFetchComments({ target, serviceUrl, headers })
  );
};

const normalizeComments = (comments: CommentResponse[]): MessageType[] =>
  comments.map(normalizeComment);

const normalizeComment = (comment: CommentResponse): MessageType => {
  return {
    // @ts-expect-error id will be there soon:
    id: comment.id,
    // eslint-disable-next-line no-underscore-dangle
    user: comment._owner || 'Unknown',
    timestamp: Number(new Date(comment.lastUpdatedTime || '')),
    text: comment.comment,
    // hide?: boolean,
    // isUnread?: boolean,
  };
};
