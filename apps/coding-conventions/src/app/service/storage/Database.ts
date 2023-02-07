import { Convention } from '../../types';
import { RawConnector } from './connectors/RawConnector';

export class Database {
  // Switch the connector here if needed
  private static connector = new RawConnector();

  private static isInitialized = false;

  static async init() {
    if (this.isInitialized) return;

    try {
      await this.connector.init();
    } finally {
      this.isInitialized = true;
    }
  }

  static async createSystem(
    title: string,
    resource: string,
    description: string | undefined,
    structure: string
  ) {
    await this.connector.createSystem({
      title,
      resource,
      description,
      structure,
    });
  }

  static async listSystems() {
    return this.connector.listSystems();
  }

  static async getSystem(id: string) {
    return this.connector.getSystem(id);
  }

  static async createConvention(
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
  ) {
    return this.connector.createConvention(systemId, { keyword, start, end });
  }

  static async updateConventions(
    systemId: string,
    updatedConventions: Convention[]
  ) {
    return this.connector.updateConventions(systemId, updatedConventions);
  }

  static async deleteConvention(conventionId: string) {
    return this.connector.deleteConvention(conventionId);
  }

  static async listConventions(systemId: string) {
    return this.connector.listConventions(systemId);
  }
}
