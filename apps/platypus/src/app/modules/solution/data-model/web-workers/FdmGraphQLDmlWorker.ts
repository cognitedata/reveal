import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { BuiltInType, mixerApiBuiltInTypes } from '@platypus/platypus-core';
import type { worker } from 'monaco-editor';
import { IFdmGraphQLDmlWorkerOptions } from './types';
import prettierStandalone from 'prettier/standalone';
import prettierGraphqlParser from 'prettier/parser-graphql';
import { CodeCompletitionService } from './language-service';

export class FdmGraphQLDmlWorker {
  private _ctx: worker.IWorkerContext;
  private codeCompletitionService: CodeCompletitionService;

  constructor(
    ctx: worker.IWorkerContext,
    createData: IFdmGraphQLDmlWorkerOptions
  ) {
    this._ctx = ctx;
    this.codeCompletitionService = new CodeCompletitionService();
  }

  public async doValidation(graphqlCode: string) {
    try {
      if (!graphqlCode) {
        return [];
      }
      const graphQlUtils = new GraphQlUtilsService();
      const markers = graphQlUtils.validate(graphqlCode, mixerApiBuiltInTypes);
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
      return this.codeCompletitionService.getCompletitions(
        graphQlString,
        textUntilPosition,
        builtInTypes
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
