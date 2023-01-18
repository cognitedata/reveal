import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  BuiltInType,
  DataModelTypeDefs,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';
import type { Position, worker } from 'monaco-editor';
import { IFdmGraphQLDmlWorkerOptions } from './types';
import prettierStandalone from 'prettier/standalone';
import prettierGraphqlParser from 'prettier/parser-graphql';
import {
  CodeCompletionService,
  HoverProviderService,
} from './language-service';

export class FdmGraphQLDmlWorker {
  private _ctx: worker.IWorkerContext;
  private codeCompletionService: CodeCompletionService;
  private hoverProviderService: HoverProviderService;

  private lastValidGraphQlSchema: string | null = null;
  private dataModelTypeDefs: DataModelTypeDefs | null = null;
  private locationTypeDefMap = {} as Record<
    string,
    { name: string; kind: 'type' | 'field'; typeName: string }
  >;

  constructor(
    ctx: worker.IWorkerContext,
    private createData: IFdmGraphQLDmlWorkerOptions
  ) {
    this._ctx = ctx;
    this.codeCompletionService = new CodeCompletionService();
    this.hoverProviderService = new HoverProviderService();
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
    textUntilPosition: string,
    builtInTypes: BuiltInType[]
  ) {
    try {
      return this.codeCompletionService.getCompletions(
        textUntilPosition,
        builtInTypes,
        !!this.createData.options?.useExtendedSdl,
        this.dataModelTypeDefs
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

      const parsedLocationTypeDefMap = {} as Record<string, any>;

      this.dataModelTypeDefs.types.forEach((typeDef) => {
        if (typeDef.location) {
          parsedLocationTypeDefMap[typeDef.location.line.toString()] = {
            name: typeDef.name,
            typeName: typeDef.name,
            kind: 'type',
          };

          typeDef.fields.forEach((fieldDef) => {
            if (fieldDef.location) {
              parsedLocationTypeDefMap[fieldDef.location.line.toString()] = {
                name: fieldDef.name,
                typeName: typeDef.name,
                kind: 'field',
              };
            }
          });
        }
      });

      this.locationTypeDefMap = parsedLocationTypeDefMap;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.dataModelTypeDefs = null;
      this.lastValidGraphQlSchema = null;
    }
  }

  public async doHover(position: Position) {
    try {
      if (!this.dataModelTypeDefs || !Object.keys(this.locationTypeDefMap)) {
        return null;
      }

      if (
        // eslint-disable-next-line
        !this.locationTypeDefMap.hasOwnProperty(position.lineNumber.toString())
      ) {
        return null;
      }

      const hoverItem = this.hoverProviderService.getHoverInformation(
        this.dataModelTypeDefs,
        this.locationTypeDefMap,
        position
      );

      return hoverItem;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
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
