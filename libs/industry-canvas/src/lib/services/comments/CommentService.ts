import { CogniteClient } from '@cognite/sdk';

import { FDMClient, gql } from '../../utils/FDMClient';
import { isNotUndefined } from '../../utils/isNotUndefined';

import { CommentFilter, Comment } from './types';
import { composeFilter, removeNullEntries } from './utils';

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

export class CommentService {
  public static readonly SYSTEM_SPACE = 'apps_comments_local'; // TODO: replace with system space
  // Note: To simplify the code, we assume that the data models and
  // the views in the system space always have the same version.
  public static readonly SYSTEM_SPACE_VERSION = '1';
  public static readonly INSTANCE_SPACE = CommentService.SYSTEM_SPACE; // TODO: should the comments perhaps live in their own space?
  public static readonly DATA_MODEL_EXTERNAL_ID = 'SharedCogniteApps';
  public static readonly COMMENT_MODEL_NAME = 'Comment';
  private readonly LIST_LIMIT = 1000; // The max number of items to retrieve in one list request

  private fdmClient: FDMClient;
  private cogniteClient: CogniteClient;

  public constructor(client: CogniteClient) {
    this.cogniteClient = client;
    this.fdmClient = new FDMClient(client, {
      systemSpace: CommentService.SYSTEM_SPACE,
      systemSpaceVersion: CommentService.SYSTEM_SPACE_VERSION,
      instanceSpace: CommentService.INSTANCE_SPACE,
    });
  }

  public async upsertComments(
    comments: Omit<Comment, 'lastUpdatedTime' | 'createdTime'>[]
  ): Promise<Comment[]> {
    const updatedComments = await this.fdmClient.upsertNodes(
      comments.map((comment) => ({
        ...comment,
        modelName: CommentService.COMMENT_MODEL_NAME,
        ...(comment.parentComment
          ? {
              parentComment: {
                externalId: comment.parentComment.externalId,
                space: CommentService.INSTANCE_SPACE,
              },
            }
          : null),
      }))
    );

    const timingMapByExternalId = new Map(
      updatedComments.map(({ externalId, lastUpdatedTime, createdTime }) => [
        externalId,
        { lastUpdatedTime, createdTime },
      ])
    );
    const commentsWithCreatedAndUpdatedTimes = comments
      .map((comment): Comment | undefined => {
        const { createdTime, lastUpdatedTime } =
          timingMapByExternalId.get(comment.externalId) ?? {};

        if (createdTime === undefined) {
          return undefined;
        }

        return {
          ...comment,
          lastUpdatedTime: new Date(lastUpdatedTime ?? Date.now()),
          createdTime: new Date(createdTime),
        };
      })
      .filter(isNotUndefined);

    return commentsWithCreatedAndUpdatedTimes;
  }

  public async deleteComments(commentExternalIds: string[]): Promise<void> {
    await this.fdmClient.deleteNodes(commentExternalIds);
  }

  public async fetchCommentsByIds(
    commentExternalIds: string[]
  ): Promise<Comment[]> {
    const res = await this.fdmClient.graphQL<{
      comments: { items: Comment[] };
    }>(
      gql`
        query GetCommentsByIds($filter: _List${CommentService.COMMENT_MODEL_NAME}Filter) {
          comments: listComment(filter: $filter) {
            items {
              text
              createdById
              status
              parentComment {
                externalId
              }

              targetId
              targetType
              contextId
              contextType
              contextData

              taggedUsers

              externalId
              lastUpdatedTime
              createdTime
            }
          }
        }
      `,
      CommentService.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            { externalId: { in: commentExternalIds } },
            {
              space: {
                eq: CommentService.INSTANCE_SPACE,
              },
            },
          ],
        },
      }
    );
    if (res.comments.items.length === 0) {
      throw new Error(
        `Couldn't find any comments with external ids ${commentExternalIds}`
      );
    }

    return res.comments.items.map(removeNullEntries);
  }

  private async getPaginatedComments(
    filter: CommentFilter,
    cursor: string | undefined = undefined,
    paginatedData: Comment[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<Comment[]> {
    const res = await this.fdmClient.graphQL<{
      comments: {
        items: (Omit<Comment, 'createdTime' | 'lastUpdatedTime'> & {
          createdTime: string;
          lastUpdatedTime: string;
        })[];
        pageInfo: PageInfo;
      };
    }>(
      gql`
        query ListComments($filter: _List${
          CommentService.COMMENT_MODEL_NAME
        }Filter) {
          comments: listComment(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`}
          ) {
            items {
              text
              createdById
              status
              parentComment {
                externalId
              }

              targetId
              targetType
              contextId
              contextType
              contextData

              taggedUsers

              externalId
              lastUpdatedTime
              createdTime
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
        }
      `,
      CommentService.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            ...composeFilter(filter),
            {
              space: {
                eq: CommentService.INSTANCE_SPACE,
              },
            },
          ],
        },
      }
    );
    const { items, pageInfo } = res.comments;

    paginatedData.push(
      ...items.map((item) => ({
        ...item,
        // Note: The dates we get from FDM are given as strings, we
        // therefore need to manually convert them to Date objects
        createdTime: new Date(item.createdTime),
        lastUpdatedTime: new Date(item.lastUpdatedTime),
      }))
    );
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedComments(
        filter,
        pageInfo.startCursor,
        paginatedData,
        limit
      );
    }

    return paginatedData;
  }

  public async listComments(filter: CommentFilter = {}): Promise<Comment[]> {
    const comments = await this.getPaginatedComments(filter);
    return comments.map(removeNullEntries);
  }
}
