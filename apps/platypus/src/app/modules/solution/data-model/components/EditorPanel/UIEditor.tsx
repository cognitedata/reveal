import { Button, Flex } from '@cognite/cogs.js';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  BuiltInType,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useEffect, useState } from 'react';
import { SchemaTypeField } from '../SchemaTypeAndField/SchemaTypeField';
import { SchemaTypeList } from '../SchemaTypeAndField/SchemaTypeList';
import { SchemaTypeView } from '../SchemaTypeAndField/SchemaTypeView';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';

interface UIEditorProps {
  builtInTypes: BuiltInType[];
  graphQLSchemaString: string;
  disabled?: boolean;
  onSchemaChange: (typeName: string) => void;
  currentType: null | DataModelTypeDefsType;
  setCurrentType: (type: null | DataModelTypeDefsType) => void;
}

export function UIEditor({
  builtInTypes,
  graphQLSchemaString,
  disabled,
  onSchemaChange,
  currentType,
  setCurrentType,
}: UIEditorProps) {
  const { t } = useTranslation('UIEditor');
  const [isInit, setIsInit] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentGraphqlSchema, setCurrentGraphqlSchema] = useState('');
  const [customTypesNames, setCustomTypesNames] = useState<string[]>([]);

  const [solutionDataModel, setSolutionDataModel] = useState<DataModelTypeDefs>(
    {
      types: [],
    }
  );
  const errorLogger = useErrorLogger();
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );

  useEffect(() => {
    if (graphQLSchemaString === '') {
      dataModelTypeDefsBuilder.clear();
    }
    if (
      graphQLSchemaString !== currentGraphqlSchema &&
      graphQLSchemaString !== ''
    ) {
      try {
        const newState =
          dataModelTypeDefsBuilder.parseSchema(graphQLSchemaString);
        setSolutionDataModel(newState);
        setCustomTypesNames(
          dataModelTypeDefsBuilder.getCustomTypesNames(newState)
        );
        setCurrentGraphqlSchema(graphQLSchemaString);
        setCurrentType(
          newState.types.find((type) => type.name === currentType?.name) || null
        );
      } catch (err) {
        errorLogger.log(err as any);
        setHasError(true);
      }
    }
    setIsInit(true);
    // eslint-disable-next-line
  }, [graphQLSchemaString]);

  const updateUiState = (
    newState: DataModelTypeDefs,
    updatedTypeName: string
  ) => {
    const updatedType = newState.types.find(
      (type) => type.name === updatedTypeName
    ) as DataModelTypeDefsType;
    setSolutionDataModel(newState);
    setCurrentType(updatedType);
    const updatedGqlSchema = dataModelTypeDefsBuilder.buildSchemaString();
    setCurrentGraphqlSchema(updatedGqlSchema);
    onSchemaChange(updatedGqlSchema);
    setCustomTypesNames(dataModelTypeDefsBuilder.getCustomTypesNames(newState));
  };

  const onFieldUpdated = (
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateDataModelFieldDTO>
  ) => {
    const newState = dataModelTypeDefsBuilder.updateField(
      solutionDataModel,
      typeName,
      fieldName,
      updates
    );
    updateUiState(newState, currentType!.name);
  };
  const onFieldRemoved = (typeName: string, fieldName: string) => {
    const newState = dataModelTypeDefsBuilder.removeField(
      solutionDataModel,
      typeName,
      fieldName
    );
    updateUiState(newState, currentType!.name);
  };
  const createSchemaType = (typeName: string) => {
    const capitalizedTypeName =
      typeName.charAt(0).toUpperCase() + typeName.slice(1);

    const defaultDirective = builtInTypes.find(
      (type) => type.type === 'DIRECTIVE'
    );

    const newState = defaultDirective
      ? dataModelTypeDefsBuilder.addType(
          solutionDataModel,
          capitalizedTypeName,
          defaultDirective.name
        )
      : dataModelTypeDefsBuilder.addType(
          solutionDataModel,
          capitalizedTypeName
        );

    updateUiState(newState, capitalizedTypeName);
  };

  const onFieldCreate = () => {
    const fieldName = '';
    const newState = dataModelTypeDefsBuilder.addField(
      solutionDataModel,
      currentType!.name,
      fieldName,
      {
        name: fieldName,
        type: 'String',
      }
    );
    const updatedType = newState.types.find(
      (type) => type.name === currentType!.name
    ) as DataModelTypeDefsType;
    setSolutionDataModel(newState);
    setCurrentType(updatedType);
  };

  const renameSchemaType = (oldValue: string, newValue: string) => {
    updateUiState(
      dataModelTypeDefsBuilder.renameType(
        solutionDataModel,
        oldValue,
        newValue
      ),
      newValue
    );
  };

  const deleteSchemaType = (typeName: string) => {
    updateUiState(
      dataModelTypeDefsBuilder.removeType(solutionDataModel, typeName),
      typeName
    );
  };

  if (!isInit) {
    return <Spinner />;
  }

  if (hasError) {
    return <ErrorPlaceholder />;
  }

  return (
    <>
      {currentType ? (
        <SchemaTypeView
          currentType={currentType}
          onNavigateBack={() => setCurrentType(null)}
        >
          <Flex direction="column" gap={16}>
            {currentType.fields.map((field, index) => (
              <SchemaTypeField
                index={index}
                field={field}
                key={field.name}
                disabled={disabled}
                builtInTypes={builtInTypes}
                customTypesNames={customTypesNames.filter(
                  (name) => name !== currentType.name
                )}
                typeFieldNames={currentType.fields.map((f) => f.name)}
                onFieldUpdated={(updates) =>
                  onFieldUpdated(currentType.name, field.name, updates)
                }
                onFieldRemoved={(removedField) =>
                  onFieldRemoved(currentType.name, removedField.name)
                }
              />
            ))}
            <Button
              icon="Add"
              iconPlacement="left"
              aria-label={t('add_field', 'Add field')}
              type="ghost"
              disabled={
                disabled || currentType.fields.some((field) => !field.name)
              }
              style={{
                alignSelf: 'flex-start',
                marginBottom: '8px',
                marginLeft: '16px',
                padding: '4px 8px 4px 8px',
              }}
              onClick={onFieldCreate}
            >
              {t('add_field', 'Add field')}
            </Button>
          </Flex>
        </SchemaTypeView>
      ) : (
        <SchemaTypeList
          disabled={disabled}
          createSchemaType={createSchemaType}
          renameSchemaType={renameSchemaType}
          deleteSchemaType={deleteSchemaType}
          setCurrentType={setCurrentType}
          objectTypes={solutionDataModel.types}
        />
      )}
    </>
  );
}
