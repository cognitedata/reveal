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
import useSelector from '@platypus-app/hooks/useSelector';
import { useSolution } from '@platypus-app/modules/solution/hooks/useSolution';

interface UIEditorProps {
  builtInTypes: BuiltInType[];
  graphQLSchemaString: string;
  disabled?: boolean;
  onSchemaChange: (typeName: string) => void;
}

export function UIEditor({
  builtInTypes,
  graphQLSchemaString,
  disabled,
  onSchemaChange,
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
  const { setCurrentTypeName } = useSolution();
  const currentTypeName = useSelector(
    (state) => state.dataModel.currentTypeName
  );
  const errorLogger = useErrorLogger();
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const currentType = solutionDataModel.types.find(
    (type) => type.name === currentTypeName
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
      } catch (err) {
        errorLogger.log(err as any);
        setHasError(true);
      }
    }
    setIsInit(true);
    // eslint-disable-next-line
  }, [graphQLSchemaString]);

  const updateUiState = (newState: DataModelTypeDefs) => {
    setSolutionDataModel(newState);
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
    updateUiState(newState);
  };
  const onFieldRemoved = (typeName: string, fieldName: string) => {
    const newState = dataModelTypeDefsBuilder.removeField(
      solutionDataModel,
      typeName,
      fieldName
    );
    updateUiState(newState);
  };
  const createSchemaType = (typeName: string) => {
    const capitalizedTypeName =
      typeName.charAt(0).toUpperCase() + typeName.slice(1);

    const dataModelWithNewType = dataModelTypeDefsBuilder.addType(
      solutionDataModel,
      capitalizedTypeName
    );

    updateUiState(dataModelWithNewType);

    /*
    Add a field *after* calling updateUiState because we want the schema string to be
    updated with the new Type but *not* with the new Field since the field will not
    have a value until the user types one and we want to avoid having an invalid schema
    string with '' for the name of the field.
    */
    const fieldName = '';
    const dataModelWithNewField = dataModelTypeDefsBuilder.addField(
      dataModelWithNewType,
      typeName,
      fieldName,
      {
        name: fieldName,
        type: 'String',
      }
    );

    const updatedType = dataModelWithNewField.types.find(
      (type) => type.name === typeName
    ) as DataModelTypeDefsType;
    setSolutionDataModel(dataModelWithNewField);
    setCurrentTypeName(updatedType.name);
  };

  const onFieldCreate = () => {
    const fieldName = '';
    const newState = dataModelTypeDefsBuilder.addField(
      solutionDataModel,
      currentTypeName!,
      fieldName,
      {
        name: fieldName,
        type: 'String',
      }
    );
    setSolutionDataModel(newState);
  };

  const renameSchemaType = (oldValue: string, newValue: string) => {
    updateUiState(
      dataModelTypeDefsBuilder.renameType(solutionDataModel, oldValue, newValue)
    );
  };

  const deleteSchemaType = (typeName: string) => {
    updateUiState(
      dataModelTypeDefsBuilder.removeType(solutionDataModel, typeName)
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
      {currentTypeName ? (
        <SchemaTypeView
          currentTypeName={currentTypeName}
          onNavigateBack={() => setCurrentTypeName(null)}
        >
          <Flex direction="column" gap={16}>
            {currentType &&
              currentType.fields.map((field, index) => (
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
            {!disabled && (
              <Button
                icon="Add"
                iconPlacement="left"
                aria-label={t('add_field', 'Add field')}
                type="ghost"
                disabled={
                  disabled || currentType?.fields.some((field) => !field.name)
                }
                style={{
                  alignSelf: 'flex-start',
                  marginBottom: '8px',
                  marginLeft: '8px',
                  padding: '4px 8px 4px 8px',
                }}
                onClick={onFieldCreate}
              >
                {t('add_field', 'Add field')}
              </Button>
            )}
          </Flex>
        </SchemaTypeView>
      ) : (
        <SchemaTypeList
          disabled={disabled}
          createSchemaType={createSchemaType}
          renameSchemaType={renameSchemaType}
          deleteSchemaType={deleteSchemaType}
          objectTypes={solutionDataModel.types}
        />
      )}
    </>
  );
}
