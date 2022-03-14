import { Button, Flex } from '@cognite/cogs.js';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  SolutionDataModel,
  SolutionDataModelType,
  UpdateSolutionDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as solutionActions } from '@platypus-app/redux/reducers/global/solutionReducer';
import { RootState } from '@platypus-app/redux/store';

import services from '../../di';
import { SchemaTypeField } from '../SchemaTypeAndField/SchemaTypeField';
import { SchemaTypeFieldsList } from '../SchemaTypeAndField/SchemaTypeFieldsList';
import { SchemaTypeList } from '../SchemaTypeAndField/SchemaTypeList';
import { SchemaTypeView } from '../SchemaTypeAndField/SchemaTypeView';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';

const dataModelService = services.solutionDataModelService;

interface UIEditorProps {
  graphQLSchemaString: string;
  disabled?: boolean;
  onSchemaChange: (typeName: string) => void;
}

export function UIEditor({
  graphQLSchemaString,
  disabled,
  onSchemaChange,
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
  const currentType = useSelector(
    (state: RootState) => state.solution.currentType
  );
  const dispatch = useDispatch();
  const errorLogger = useErrorLogger();
  const setCurrentType = (type: null | SolutionDataModelType) =>
    dispatch(solutionActions.setCurrentType(type));

  useEffect(() => {
    if (graphQLSchemaString !== currentGraphqlSchema) {
      try {
        const newState = dataModelService.parseSchema(graphQLSchemaString);
        setSolutionDataModel(newState);
        setCustomTypesNames(dataModelService.getCustomTypesNames(newState));
        setCurrentGraphqlSchema(graphQLSchemaString);
      } catch (err) {
        errorLogger.log(err as any);
        setHasError(true);
      }
    }
    setIsInit(true);
    // eslint-disable-next-line
  }, [graphQLSchemaString]);

  const updateUiState = useCallback(
    (newState: SolutionDataModel, updatedTypeName: string) => {
      const updatedType = newState.types.find(
        (type) => type.name === updatedTypeName
      ) as SolutionDataModelType;
      setSolutionDataModel(newState);
      setCurrentType(updatedType);
      const updatedGqlSchema = dataModelService.buildSchemaString();
      setCurrentGraphqlSchema(updatedGqlSchema);
      onSchemaChange(updatedGqlSchema);
    },
    []
  );

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
    const newState = dataModelService.addType(
      solutionDataModel,
      capitalizedTypeName
    );

    updateUiState(newState, capitalizedTypeName);
    setCustomTypesNames(dataModelService.getCustomTypesNames(newState));
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
          <SchemaTypeFieldsList>
            <Flex direction="column" gap={16}>
              {currentType.fields.map((field) => (
                <SchemaTypeField
                  field={field}
                  key={field.name}
                  disabled={disabled}
                  customTypesNames={customTypesNames}
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
                disabled={disabled}
                style={{ alignSelf: 'flex-start', marginLeft: '10px' }}
                onClick={onFieldCreate}
              >
                {t('add_field', 'Add field')}
              </Button>
            </Flex>
          </SchemaTypeFieldsList>
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
