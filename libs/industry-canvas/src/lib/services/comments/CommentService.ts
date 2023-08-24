import { CogniteClient } from '@cognite/sdk';

import { FDMClient, gql } from '../../utils/FDMClient';
import { isNotUndefined } from '../../utils/isNotUndefined';

import { CdfUser, CommentFilter, SerializedComment } from './types';
import { composeFilter, removeNullEntries } from './utils';

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

enum ModelNames {
  USER = 'CDF_User',
  COMMENT = 'CDF_Comment',
}
export class CommentService {
  public static readonly SYSTEM_SPACE = 'cdf_apps_shared';
  // Note: To simplify the code, we assume that the data models and
  // the views in the system space always have the same version.
  public static readonly SYSTEM_SPACE_VERSION = 'v1';
  public static readonly INSTANCE_SPACE = 'CommentInstanceSpace';
  public static readonly DATA_MODEL_EXTERNAL_ID = 'SharedCogniteApps';
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
    // First, we upsert the User Profile proxy nodes – just to make sure that
    // they actually exist. This is a short term hack/fix while the user
    // profiles nodes do not natively live in FDM.
    await this.fdmClient.upsertNodes(
      comments.map(({ createdBy }) => ({
        modelName: ModelNames.USER,
        externalId: createdBy.externalId,
        email: createdBy.email,
      }))
    );

    const updatedComments = await this.fdmClient.upsertNodes(
      comments.map((comment) => ({
        ...comment,
        createdBy: {
          externalId: comment.createdBy.externalId,
          space: CommentService.INSTANCE_SPACE,
        },
        modelName: ModelNames.COMMENT,
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
        items: (Omit<
          SerializedComment,
          'createdTime' | 'lastUpdatedTime' | 'taggedUsers'
        > & {
          createdTime: string;
          lastUpdatedTime: string;
          taggedUsers: { items: CdfUser[] } | null;
        })[];
        pageInfo: PageInfo;
      };
    }>(
      gql`
        query ListComments($filter: _List${ModelNames.COMMENT}Filter) {
          comments: list${ModelNames.COMMENT}(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`}
          ) {
            items {
              text
              createdBy
              status
              parentComment

              targetId
              targetType
              targetSubType
              targetContext

              taggedUsers {
                items {
                  externalId
                  email
                }
              }

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
        taggedUsers: item.taggedUsers?.items,
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
