import { Convention, Resource, System } from '../../../types';

export abstract class StorageDAO {
  abstract init(): Promise<void>;

  abstract createSystem({
    title,
    description,
    structure,
  }: {
    title: string;
    resource: Resource;
    description: string | undefined;
    structure: string;
  }): Promise<string>;
  abstract listSystems(): Promise<System[]>;
  abstract getSystem(id: string): Promise<System>;

  abstract createConvention(
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
  ): Promise<void>;
  abstract updateConventions(
    systemId: string,
    updatedConventions: Convention[]
  ): Promise<void>;
  abstract deleteConvention(conventionId: string): Promise<void>;
  abstract listConventions(systemId: string): Promise<Convention[]>;
}
