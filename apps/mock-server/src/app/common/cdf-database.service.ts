import { CdfMockDatabase, CdfResourceObject } from '../types';

export class CdfDatabaseService {
  private cdfDb: CdfMockDatabase;
  private storeKey: string;
  private constructor(db: CdfMockDatabase, storeKey: string) {
    this.cdfDb = db;
    this.storeKey = storeKey;
  }

  static from(db: CdfMockDatabase, storeKey: string) {
    return new CdfDatabaseService(db, storeKey);
  }

  getState() {
    return this.cdfDb.get(this.storeKey).value();
  }

  exists(): boolean {
    const store = this.cdfDb.get(this.storeKey);
    if (!store) {
      return false;
    }
    return true;
  }

  insert(object: CdfResourceObject): CdfResourceObject {
    const resource = (this.cdfDb.get(this.storeKey) as any)
      .insert(object)
      .value();
    this.cdfDb.write();
    return resource;
  }

  updateBy(
    param: Record<string, string | number>,
    object: CdfResourceObject
  ): CdfResourceObject {
    const obj = this.cdfDb.get(this.storeKey).find(param);
    if (obj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resource = (this.cdfDb.get(this.storeKey) as any)
        .updateById(object)
        .value();
      this.cdfDb.write();
      return resource;
    }
  }

  find(param: Record<string, string | number>): CdfResourceObject | undefined {
    const store = this.cdfDb.get(this.storeKey);
    if (!store) {
      return undefined;
    }

    return store.find(param).value();
  }

  deleteByKey(param: Record<string, string | number>): void {
    const obj = this.find(param);
    if (obj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.cdfDb.get(this.storeKey) as any).removeById(obj.id).value();
      this.cdfDb.write();
    }
  }
}
