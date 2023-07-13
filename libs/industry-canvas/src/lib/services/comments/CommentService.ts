import { CogniteClient } from '@cognite/sdk';

import { FDMClient, gql } from '../../utils/FDMClient';
import { isNotUndefined } from '../../utils/isNotUndefined';

import { CommentFilter, SerializedComment } from './types';
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
    comments: Omit<SerializedComment, 'lastUpdatedTime' | 'createdTime'>[]
  ): Promise<SerializedComment[]> {
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

    const createdTimeByExternalId = new Map(
      updatedComments.map(({ externalId, createdTime }) => [
        externalId,
        createdTime,
      ])
    );
    const lastUpdatedTimeByExternalId = new Map(
      updatedComments.map(({ externalId, lastUpdatedTime }) => [
        externalId,
        lastUpdatedTime,
      ])
    );
    const commentsWithCreatedAndUpdatedTimes = comments
      .map((comment): SerializedComment | undefined => {
        const createdTime = createdTimeByExternalId.get(comment.externalId);
        const lastUpdatedTime = lastUpdatedTimeByExternalId.get(
          comment.externalId
        );
        if (createdTime === undefined || lastUpdatedTime === undefined) {
          return undefined;
        }

        return {
          ...comment,
          lastUpdatedTime: new Date(lastUpdatedTime),
          createdTime: new Date(createdTime),
        };
      })
      .filter(isNotUndefined);

    return commentsWithCreatedAndUpdatedTimes;
  }

  public async deleteComments(commentExternalIds: string[]): Promise<void> {
    await this.fdmClient.deleteNodes(commentExternalIds);
  }

  private async getPaginatedComments(
    filter: CommentFilter,
    cursor: string | undefined = undefined,
    paginatedData: SerializedComment[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<SerializedComment[]> {
    const res = await this.fdmClient.graphQL<{
      comments: {
        items: (Omit<SerializedComment, 'createdTime' | 'lastUpdatedTime'> & {
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

  public async listComments(
    filter: CommentFilter = {}
  ): Promise<SerializedComment[]> {
    const comments = await this.getPaginatedComments(filter);
    return comments.map(removeNullEntries);
  }
}
