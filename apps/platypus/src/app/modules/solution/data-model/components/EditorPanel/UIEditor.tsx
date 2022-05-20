import { Button, Flex } from '@cognite/cogs.js';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  BuiltInType,
  SolutionDataModel,
  SolutionDataModelType,
  UpdateSolutionDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useEffect, useState } from 'react';
import { SchemaTypeField } from '../SchemaTypeAndField/SchemaTypeField';
import { SchemaTypeList } from '../SchemaTypeAndField/SchemaTypeList';
import { SchemaTypeView } from '../SchemaTypeAndField/SchemaTypeView';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';
import dataModelServices from '../../di';
const dataModelService = dataModelServices.dataModelService;

interface UIEditorProps {
  builtInTypes: BuiltInType[];
  graphQLSchemaString: string;
  disabled?: boolean;
  onSchemaChange: (typeName: string) => void;
  currentType: null | SolutionDataModelType;
  setCurrentType: (type: null | SolutionDataModelType) => void;
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

  const [solutionDataModel, setSolutionDataModel] = useState<SolutionDataModel>(
    {
      types: [],
    }
  );
  const errorLogger = useErrorLogger();

  useEffect(() => {
    if (graphQLSchemaString === '') {
      dataModelService.clear();
    }
    if (
      graphQLSchemaString !== currentGraphqlSchema &&
      graphQLSchemaString !== ''
    ) {
      try {
        const newState = dataModelService.parseSchema(graphQLSchemaString);
        setSolutionDataModel(newState);
        setCustomTypesNames(dataModelService.getCustomTypesNames(newState));
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
    newState: SolutionDataModel,
    updatedTypeName: string
  ) => {
    const updatedType = newState.types.find(
      (type) => type.name === updatedTypeName
    ) as SolutionDataModelType;
    setSolutionDataModel(newState);
    setCurrentType(updatedType);
    const updatedGqlSchema = dataModelService.buildSchemaString();
    setCurrentGraphqlSchema(updatedGqlSchema);
    onSchemaChange(updatedGqlSchema);
    setCustomTypesNames(dataModelService.getCustomTypesNames(newState));
  };

  const onFieldUpdated = (
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateSolutionDataModelFieldDTO>
  ) => {
    const newState = dataModelService.updateField(
      solutionDataModel,
      typeName,
      fieldName,
      updates
    );
    updateUiState(newState, currentType!.name);
  };
  const onFieldRemoved = (typeName: string, fieldName: string) => {
    const newState = dataModelService.removeField(
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
      ? dataModelService.addType(
          solutionDataModel,
          capitalizedTypeName,
          defaultDirective.name
        )
      : dataModelService.addType(solutionDataModel, capitalizedTypeName);

    updateUiState(newState, capitalizedTypeName);
  };

  const onFieldCreate = () => {
    const fieldName = '';
    const newState = dataModelService.addField(
      solutionDataModel,
      currentType!.name,
      fieldName,
      {
        name: fieldName,
        type: 'String',
      }
    );
    updateUiState(newState, currentType!.name);
  };

  const renameSchemaType = (oldValue: string, newValue: string) => {
    updateUiState(
      dataModelService.renameType(solutionDataModel, oldValue, newValue),
      newValue
    );
  };

  const deleteSchemaType = (typeName: string) => {
    updateUiState(
      dataModelService.removeType(solutionDataModel, typeName),
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
                marginLeft: '8px',
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
