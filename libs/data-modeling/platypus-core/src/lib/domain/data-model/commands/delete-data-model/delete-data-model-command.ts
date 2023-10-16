import chunk from 'lodash/chunk';
import uniqBy from 'lodash/uniqBy';

import type { CogniteClient } from '@cognite/sdk';

import { PlatypusError } from '../../../../boundaries/types';
import {
  ContainersApiService,
  DataModelsApiService,
  ViewsApiService,
} from '../../providers/fdm-next';
import { ItemsWithCursor } from '../../providers/fdm-next/dto/dms-common-dtos';
import {
  DataModelDTO,
  DataModelInstanceDTO,
} from '../../providers/fdm-next/dto/dms-data-model-dtos';

import { DeleteDataModelDTO, DeleteDataModelOutput } from './dto';

export class DeleteDataModelCommand {
  constructor(
    private dataModelsApi: DataModelsApiService,
    private containersApi: ContainersApiService,
    private viewsApi: ViewsApiService
  ) {}

  static create(sdkClient: CogniteClient): DeleteDataModelCommand {
    return new DeleteDataModelCommand(
      new DataModelsApiService(sdkClient),
      new ContainersApiService(sdkClient),
      new ViewsApiService(sdkClient)
    );
  }

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  async execute(
    dto: DeleteDataModelDTO,
    deleteViews: boolean
  ): Promise<DeleteDataModelOutput> {
    // fetch data model (all versions) (note the disable is because of a false positive)
    // eslint-disable-next-line testing-library/no-await-sync-query
    const { items: dataModelVersions } = await this.dataModelsApi.getByIds({
      items: [{ externalId: dto.externalId, space: dto.space }],
    });

    // identify all views across all versions
    const viewRefsKeys = new Set<string>();
    dataModelVersions.forEach((version) => {
      (version.views || []).forEach((view) =>
        viewRefsKeys.add(this.convertViewRefToKey(view))
      );
    });

    const allDataModels = await this.autoPageToArray((cursor) =>
      this.dataModelsApi.list(
        cursor
          ? {
              cursor,
              limit: 100,
            }
          : undefined
      )
    );

    const referencedViews = new Map<string, DataModelDTO[]>();

    allDataModels.forEach((dataModel) => {
      if (
        dataModel.externalId === dto.externalId &&
        dataModel.space === dto.space
      ) {
        // skip if the same data model
        return;
      }
      dataModel.views?.forEach((viewRef) => {
        const key = this.convertViewRefToKey(viewRef);
        // if another data model contains views that were originally planned to be deleted
        if (viewRefsKeys.delete(key) || referencedViews.has(key)) {
          referencedViews.set(
            key,
            (referencedViews.get(key) || []).concat([dataModel])
          );
        }
      });
    });

    try {
      if (deleteViews) {
        const viewRefs = Array.from(viewRefsKeys).map(this.convertKeyToViewRef);

        // delete all views
        await Promise.all(
          // DMS limit right now is 100
          chunk(viewRefs, 100).map((chunk) => this.viewsApi.delete(chunk))
        );
        // delete all containers
        const containerRefs = uniqBy(viewRefs, (el) =>
          JSON.stringify([el.externalId, el.space])
        );
        await Promise.all(
          chunk(containerRefs, 100).map((chunk) =>
            this.containersApi.delete(
              chunk.map((item) => ({
                externalId: item.externalId,
                space: item.space,
              }))
            )
          )
        );
      }

      // delete all versions of the data model
      await Promise.all(
        chunk(dataModelVersions, 100).map((chunk: DataModelInstanceDTO[]) =>
          this.dataModelsApi.delete({
            items: chunk.map((item: DataModelInstanceDTO) => ({
              space: item.space,
              version: item.version,
              externalId: item.externalId,
            })),
          })
        )
      );

      return {
        success: true,
        // this is the list of views that were kept
        referencedViews: Array.from(referencedViews).map(([key, value]) => ({
          ...this.convertKeyToViewRef(key),
          dataModels: value,
        })),
      };
    } catch (err) {
      if ((err as PlatypusError).code === 403) {
        return Promise.reject({
          name: 'Failed to delete the Data Model, insufficient access rights.',
        });
      }
      return Promise.reject(err);
    }
  }

  // helper functions
  private convertViewRefToKey = ({
    space,
    externalId,
    version,
  }: {
    space: string;
    externalId: string;
    version: string;
  }) => JSON.stringify({ space, externalId, version });

  private convertKeyToViewRef = (key: string) => {
    return JSON.parse(key) as {
      space: string;
      externalId: string;
      version: string;
    };
  };

  // Recursively fetches a paginated API request towards Cognite
  // expects the fetch fn to return `nextCursor` when there is an next page
  private autoPageToArray = async <T>(
    fn: (cursor?: string) => Promise<ItemsWithCursor<T>>,
    cursor?: string
  ): Promise<T[]> => {
    const { items, nextCursor } = await fn(cursor);
    if (nextCursor) {
      return items.concat(await this.autoPageToArray(fn, nextCursor));
    }
    return items;
  };
}
