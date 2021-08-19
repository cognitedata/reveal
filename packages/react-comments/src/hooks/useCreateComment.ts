import axios from 'axios';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';

interface Props {
  comment: string;
  project: string;
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}

export const useCreateComment: (a: Props) => Promise<any> = ({
  target,
  comment,
  project,
  headers,
  serviceUrl,
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/${project}/comment`,
      {
        target,
        comment,
      },
      { headers }
    )
    .then((result) => {
      return result;
    });
};
