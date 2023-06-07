import { CogniteClient } from '@cognite/sdk';

import { getCogniteSDKClient } from '../../../../cogniteSdk';
import { Convention, System } from '../../../types';
import { generateId } from '../../../utils/generators';

import { StorageDAO } from './dao';

const DB_NAME = 'coding-conventions';
const TABLE_SYSTEM_NAME = 'system';
const TABLE_CONVENTION_NAME = 'convention';

export class RawConnector extends StorageDAO {
  private sdk: CogniteClient = getCogniteSDKClient();

  private async generateDatabase() {
    try {
      await this.sdk.raw.createDatabases([{ name: DB_NAME }]);
    } catch (error: any) {
      let throwError = true;

      if ('duplicated' in error) {
        const isDuplicated = error.duplicated.some(
          (item: { name: string }) => item.name === DB_NAME
        );

        if (isDuplicated) {
          throwError = false;
        }
      }

      if (throwError) {
        throw error;
      }
    }
  }

  private async generateSystemTable() {
    try {
      await this.sdk.raw.createTables(DB_NAME, [{ name: TABLE_SYSTEM_NAME }]);
    } catch (error) {
      console.table(error);
    }
  }

  private async generateConventionTable() {
    try {
      await this.sdk.raw.createTables(DB_NAME, [
        { name: TABLE_CONVENTION_NAME },
      ]);
    } catch (error) {
      console.table(error);
    }
  }

  async init() {
    await this.generateDatabase();

    await this.generateSystemTable();
    await this.generateConventionTable();
  }

  async createConvention(
    systemId: string,
    {
      keyword,
      start,
      end,
    }: {
      keyword: string;
      start: number;
      end: number;
    }
  ): Promise<void> {
    const key = generateId();

    await this.sdk.raw.insertRows(DB_NAME, TABLE_CONVENTION_NAME, [
      {
        key,
        columns: { keyword, start, end, systemId },
      },
    ]);
  }

  async updateConventions(
    systemId: string,
    updatedConventions: Convention[]
  ): Promise<void> {
    const transformConventions = updatedConventions.map(
      ({ id, updatedAt: _ignore, ...rest }) => {
        return {
          key: id,
          columns: rest,
        };
      }
    );

    if (transformConventions.length === 0) {
      return;
    }

    await this.sdk.raw.insertRows(
      DB_NAME,
      TABLE_CONVENTION_NAME,
      transformConventions
    );
  }

  async deleteConvention(conventionId: string): Promise<void> {
    await this.sdk.raw.deleteRows(DB_NAME, TABLE_CONVENTION_NAME, [
      { key: conventionId },
    ]);
  }

  async listConventions(systemId: string): Promise<Convention[]> {
    const results = await this.sdk.raw.listRows(DB_NAME, TABLE_CONVENTION_NAME);

    return results.items.reduce((acc, item) => {
      if (item.columns.systemId === systemId) {
        const convention: Convention = {
          id: item.key,
          updatedAt: item.lastUpdatedTime,
          ...(item.columns as any),
        };

        return [...acc, convention];
      }

      return acc;
    }, [] as Convention[]);
  }

  async createSystem({
    title,
    resource,
    description,
    structure,
  }: {
    title: string;
    resource: string;
    description: string | undefined;
    structure: string;
  }): Promise<string> {
    const key = generateId();

    await this.sdk.raw.insertRows(DB_NAME, TABLE_SYSTEM_NAME, [
      { key, columns: { title, resource, description, structure } },
    ]);

    return key;
  }

  async listSystems(): Promise<System[]> {
    const data = await this.sdk.raw.listRows(DB_NAME, TABLE_SYSTEM_NAME);

    return data.items.map((item) => {
      return {
        id: item.key,
        updatedAt: item.lastUpdatedTime,
        ...(item.columns as any),
      };
    });
  }

  async getSystem(id: string): Promise<System> {
    const data = await this.sdk.raw.retrieveRow(DB_NAME, TABLE_SYSTEM_NAME, id);

    return {
      id: data.key,
      ...(data.columns as any),
    };
  }
}
