/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TypeDefsParserService } from '@platypus/platypus-common-utils';
import {
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldType,
  DataModelTypeDefsType,
  DirectiveProps,
} from '@platypus/platypus-core';

import { DOCUMENTATION_LINK } from './constants';
import { HoverItem, LocationTypesMap } from './types';

export class HoverProviderService {
  private graphQlUtils: TypeDefsParserService;
  constructor() {
    this.graphQlUtils = new TypeDefsParserService();
  }
  getHoverInformation(
    dataModelTypeDefs: DataModelTypeDefs,
    locationTypesMap: LocationTypesMap,
    position: { lineNumber: number; column: number }
  ): HoverItem {
    const graphQlNodeOnLineNumber =
      locationTypesMap[position.lineNumber.toString()];

    let graphQlNode;
    let markdownContent = '';
    const graphQlType = dataModelTypeDefs.types.find(
      (typeDef) => typeDef.name === graphQlNodeOnLineNumber.typeName
    );
    graphQlNode = graphQlType;

    if (graphQlNodeOnLineNumber.kind === 'field') {
      const fieldNode = graphQlType?.fields.find(
        (fieldDef) => fieldDef.name === graphQlNodeOnLineNumber.name
      );
      graphQlNode = fieldNode;

      if (!fieldNode?.type.custom) {
        const content = [] as string[];

        this.renderPrimitiveField(content, graphQlType!, fieldNode!);

        markdownContent = content.join('').trim();
      } else {
        const content = [] as string[];
        this.renderCustomField(content, dataModelTypeDefs, fieldNode!);

        markdownContent = content.join('').trim();
      }
    } else {
      const content = [] as string[];

      this.renderTypeInfo(content, dataModelTypeDefs, graphQlType!);

      markdownContent = content.join('').trim();
    }

    return {
      range: {
        startLineNumber: graphQlNode?.location?.line as number,
        startColumn: 1,
        endLineNumber: graphQlNode?.location?.line as number,
        endColumn: graphQlNode?.location?.column as number,
      },
      content: markdownContent,
    };
  }

  private renderPrimitiveField(
    content: string[],
    type: DataModelTypeDefsFieldType,
    field: DataModelTypeDefsField
  ) {
    const fieldType = field.type.list
      ? `[${field.type.name}]`
      : field.type.name;
    this.renderMdCodeStart(content);
    this.append(
      content,
      `(field) ${type?.name}.${field?.name}: ${fieldType} - ${
        field.nonNull ? 'Not nullable' : 'Nullable'
      }`
    );
    this.renderMdCodeEnd(content);

    if (field.description) {
      this.append(content, '\n' + field.description);
    }
  }

  private renderCustomField(
    content: string[],
    dataModelTypeDefs: DataModelTypeDefs,
    field: DataModelTypeDefsField
  ) {
    const referencedTypeName = field?.type.name;
    const referencedType = dataModelTypeDefs.types.find(
      (type) => type.name === referencedTypeName
    );
    this.graphQlUtils.clear();
    this.graphQlUtils.setType(referencedType!.name, referencedType!);
    const referencedTypeSdl = this.graphQlUtils.generateSdl();

    this.renderMdCodeStart(content);
    this.append(content, referencedTypeSdl);
    this.renderMdCodeEnd(content);

    if (field.description) {
      this.append(content, '\n' + field.description);
    }
    this.append(content, '\n\nDocumentation:\n\n' + DOCUMENTATION_LINK);
  }

  private renderTypeInfo(
    content: string[],
    dataModelTypeDefs: DataModelTypeDefs,
    type: DataModelTypeDefsType
  ) {
    this.append(content, '### View and Container mappings\n');
    this.append(content, '&nbsp;\n');
    this.append(content, '| Property | Container.property|\n| --- | --- |\n');

    const typeFieldsMap = {} as Record<string, string>;
    // We need to figure out where and how the fields are being mapped
    // taking into account the ones that are comming from interfaces or via mappings
    // the assumption is that all fields are going to be in the type, so use them as keys in the map
    // and then override
    type.fields.forEach((field) => {
      typeFieldsMap[field.name] = this.getFieldContainerMapping(
        field,
        type.name
      );
    });

    type.interfaces?.forEach((implementedInterface) => {
      const referencedInterface = dataModelTypeDefs.types.find(
        (type) => type.name === implementedInterface
      );

      if (referencedInterface) {
        referencedInterface.fields.forEach((interaceField) => {
          typeFieldsMap[interaceField.name] = this.getFieldContainerMapping(
            interaceField,
            referencedInterface.name
          );
        });
      }
    });

    Object.keys(typeFieldsMap).forEach((fieldName) =>
      this.append(content, `|${fieldName} |${typeFieldsMap[fieldName]}|\n`)
    );

    // Add empty line
    this.append(content, '\n&nbsp;\n\n');

    if (type.description) {
      this.append(content, '\n' + type.description);
    }
    this.append(content, 'Documentation:\n\n' + DOCUMENTATION_LINK);
  }

  private renderMdCodeStart(content: string[], markdownLanguage = 'graphql') {
    this.append(content, '```' + markdownLanguage + '\n');
  }
  private renderMdCodeEnd(content: string[]) {
    this.append(content, '\n```');
  }

  private append(content: string[], stringContent: string) {
    content.push(stringContent);
  }

  private getFieldContainerMapping(
    field: DataModelTypeDefsField,
    typeName: string
  ): string {
    const mappingDirectivePredicate = (fieldDirective: DirectiveProps) =>
      fieldDirective.name === 'mapping';
    if (
      field.directives?.length &&
      // eslint-disable-next-line
      field.directives.findIndex(mappingDirectivePredicate) !== -1
    ) {
      const directive = field.directives.find(mappingDirectivePredicate);
      const containerArg = directive?.arguments?.find(
        (arg) => arg.name === 'container'
      );
      const fieldArg = directive?.arguments?.find(
        (arg) => arg.name === 'property'
      );
      const spaceArg = directive?.arguments?.find(
        (arg) => arg.name === 'space'
      );
      return `**${spaceArg ? `(${spaceArg.value.value}) ` : ''}${
        containerArg ? containerArg.value.value : ''
      }${fieldArg ? '.' + fieldArg.value.value : ''}**: ${this.getFieldTypeInfo(
        field
      )}`;
    }
    return `**${typeName}.${field.name}**: ${this.getFieldTypeInfo(field)}`;
  }

  private getFieldTypeInfo(field: DataModelTypeDefsField) {
    let typeInfo = field.type.list ? '[' : '';
    typeInfo += field.type.name;
    typeInfo += field.type.list ? ']' : '';

    if (field.type.nonNull) {
      typeInfo += ', not nullable';
    }
    return typeInfo;
  }
}
