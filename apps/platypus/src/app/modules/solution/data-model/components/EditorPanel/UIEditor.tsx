import { Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { BuiltInType } from '@platypus/platypus-core';
import { useTypeDefActions } from '../../hooks/useTypeDefActions';
import { SchemaTypeList } from '../SchemaTypeAndField/SchemaTypeList';
import { SchemaTypeView } from '../SchemaTypeAndField/SchemaTypeView';
import { TypeDefFields } from '../TypeDefFields/TypeDefFields';

interface UIEditorProps {
  builtInTypes: BuiltInType[];
  disabled: boolean;
}

export function UIEditor({ builtInTypes, disabled }: UIEditorProps) {
  const { setCurrentTypeName } = useDataModelState();
  const {
    createType,
    renameType,
    deleteType,
    createField,
    updateField,
    removeField,
  } = useTypeDefActions();
  const { currentTypeName, customTypesNames, typeDefs } = useSelector(
    (state) => state.dataModel
  );

  const currentType = typeDefs.types.find(
    (type) => type.name === currentTypeName
  );

  return (
    <>
      {currentTypeName ? (
        <SchemaTypeView
          currentTypeName={currentTypeName}
          onNavigateBack={() => setCurrentTypeName(null)}
        >
          <Flex direction="column" gap={16}>
            {currentType && (
              <TypeDefFields
                key={'TypeDefFields'}
                currentType={currentType}
                builtInTypes={builtInTypes}
                disabled={disabled}
                customTypesNames={customTypesNames.filter((name) => name)}
                onFieldCreated={createField}
                onFieldUpdated={(fieldName, updates) =>
                  updateField({
                    typeName: currentType.name,
                    fieldName,
                    updates,
                  })
                }
                onFieldRemoved={removeField}
              />
            )}
          </Flex>
        </SchemaTypeView>
      ) : (
        <SchemaTypeList
          disabled={disabled}
          createSchemaType={createType}
          renameSchemaType={(oldName: string, newName: string) =>
            renameType({ oldName, newName })
          }
          deleteSchemaType={deleteType}
          objectTypes={typeDefs.types}
        />
      )}
    </>
  );
}
