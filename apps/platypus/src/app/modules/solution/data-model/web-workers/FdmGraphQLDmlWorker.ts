import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { DataModelTypeDefs } from '@platypus/platypus-core';
import type { Position, worker } from 'monaco-editor/esm/vs/editor/editor.api';
import prettierGraphqlParser from 'prettier/parser-graphql';
import prettierStandalone from 'prettier/standalone';

import {
  CodeActionsService,
  CodeCompletionService,
  HoverProviderService,
} from './language-service';
import {
  CodeActionsOptions,
  CodeEditorRange,
  CompletionList,
  DiagnosticItem,
} from './language-service/types';
import { IFdmGraphQLDmlWorkerOptions } from './types';

type LocationTypeDefInfo = {
  name: string;
  kind: 'type' | 'field';
  typeName: string;
};

export class FdmGraphQLDmlWorker {
  private _ctx: worker.IWorkerContext;
  private codeCompletionService: CodeCompletionService;
  private hoverProviderService: HoverProviderService;
  private codeActionsService: CodeActionsService;

  private lastValidGraphQlSchema: string | null = null;
  private dataModelTypeDefs: DataModelTypeDefs | null = null;
  private locationTypeDefMap = {} as Record<string, LocationTypeDefInfo>;

  constructor(
    ctx: worker.IWorkerContext,
    private createData: IFdmGraphQLDmlWorkerOptions
  ) {
    this._ctx = ctx;
    this.codeCompletionService = new CodeCompletionService();
    this.hoverProviderService = new HoverProviderService();
    this.codeActionsService = new CodeActionsService();
  }

  /**
   * Be careful when adding new parameters here, as this function
   * provide validation
   *
   * @param graphqlCode the current graphQL code
   */
  public async doValidation(graphqlCode: string) {
    try {
      if (!graphqlCode) {
        return [];
      }
      const graphQlUtils = new GraphQlUtilsService();
      const markers = graphQlUtils.validate(
        graphqlCode,
        this.createData.options
      );
      this.setGraphQlSchema(graphqlCode);
      return markers;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    }
  }

  /**
   * Be careful when adding new parameters here, as this function
   * provide code completion for the current line
   *
   * @param textUntilPosition the text until this point
   * @param builtInTypes all of the types of the most recent correct data model
   */
  public async doComplete(
    graphqlCode: string,
    position: Position
  ): Promise<CompletionList> {
    try {
      return this.codeCompletionService.getCompletions(
        graphqlCode,
        this.lastValidGraphQlSchema || '',
        position,
        !!this.createData.options?.useExtendedSdl
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return { suggestions: [] };
    }
  }

  /**
   * Be careful when adding new parameters here, as this function
   * provide formatting (prettier) on the code
   *
   * @param graphqlCode the current graphQL code
   */
  public async doFormat(graphqlCode: string): Promise<string | null> {
    if (!graphqlCode) {
      return null;
    }

    return prettierStandalone.format(graphqlCode, {
      parser: 'graphql',
      plugins: [prettierGraphqlParser],
      tabWidth: 2,
    });
  }

  /**
   * This function sets a VALID graphql data model as the internal graphql code
   * SHOULD ONLY RUN THIS IF GRAPHQL IS VALID
   *
   * @param graphQlString the current graphQL code
   */
  public async setGraphQlSchema(graphQlString: string) {
    try {
      const graphQlUtils = new GraphQlUtilsService();
      this.dataModelTypeDefs = graphQlUtils.parseSchema(
        graphQlString,
        [],
        true
      );

      const parsedLocationTypeDefMap = {} as Record<
        string,
        LocationTypeDefInfo
      >;

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
      this.lastValidGraphQlSchema = graphQlString;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  /**
   * Be careful when adding new parameters here, as this function
   * provide details based on what's been hovered above
   *
   * @param position the position of the hover
   */
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

  /**
   * Be careful when adding new parameters here, as this function
   * provide code action based on current range of code
   *
   * @param graphQlCode the current graphQL code
   * @param range the range of code to provide code actions
   * @param diagnostics markers (for monaco)
   * @param options additonal options (for monaco)
   */
  public getCodeAction(
    graphQlCode: string,
    range: CodeEditorRange,
    diagnostics: DiagnosticItem[],
    options: CodeActionsOptions
  ) {
    return this.codeActionsService.getCodeActions(
      graphQlCode,
      range,
      diagnostics,
      options,
      this.dataModelTypeDefs
    );
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
