import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  BuiltInType,
  DataModelTypeDefs,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';
import type { worker } from 'monaco-editor';
import { IFdmGraphQLDmlWorkerOptions } from './types';
import prettierStandalone from 'prettier/standalone';
import prettierGraphqlParser from 'prettier/parser-graphql';
import { CodeCompletionService } from './language-service';

export class FdmGraphQLDmlWorker {
  private _ctx: worker.IWorkerContext;
  private codeCompletionService: CodeCompletionService;

  private lastValidGraphQlSchema: string | null = null;
  private dataModelTypeDefs: DataModelTypeDefs | null = null;

  constructor(
    ctx: worker.IWorkerContext,
    private createData: IFdmGraphQLDmlWorkerOptions
  ) {
    this._ctx = ctx;
    this.codeCompletionService = new CodeCompletionService();
  }

  public async doValidation(graphqlCode: string) {
    try {
      if (!graphqlCode) {
        return [];
      }
      const graphQlUtils = new GraphQlUtilsService();
      const markers = graphQlUtils.validate(
        graphqlCode,
        mixerApiBuiltInTypes,
        this.createData.options
      );
      return markers;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    }
  }

  public async doComplete(
    graphQlString: string,
    textUntilPosition: string,
    builtInTypes: BuiltInType[]
  ) {
    try {
      return this.codeCompletionService.getCompletions(
        graphQlString,
        textUntilPosition,
        builtInTypes,
        !!this.createData.options?.useExtendedSdl
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    }
  }

  async doFormat(graphqlCode: string): Promise<string | null> {
    if (!graphqlCode) {
      return null;
    }

    return prettierStandalone.format(graphqlCode, {
      parser: 'graphql',
      plugins: [prettierGraphqlParser],
      tabWidth: 2,
    });
  }

  public async setGraphQlSchema(graphQlString: string) {
    try {
      this.lastValidGraphQlSchema = graphQlString;
      const graphQlUtils = new GraphQlUtilsService();
      this.dataModelTypeDefs = graphQlUtils.parseSchema(
        this.lastValidGraphQlSchema
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.dataModelTypeDefs = null;
      this.lastValidGraphQlSchema = null;
    }
  }
}

export default {
  FdmGraphQLDmlWorker,
};

export function create(
  ctx: worker.IWorkerContext,
  createData: IFdmGraphQLDmlWorkerOptions
): FdmGraphQLDmlWorker {
  return new FdmGraphQLDmlWorker(ctx, createData);
}
