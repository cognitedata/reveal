import { useParams } from 'react-router-dom';

import { Flex } from '@cognite/cogs.js';

import { useCustomTypeNames } from '../../../../../hooks/useDataModelActions';
import useSelector from '../../../../../hooks/useSelector';
import { useDataModelState } from '../../../hooks/useDataModelState';
import { useTypeDefActions } from '../../hooks/useTypeDefActions';
import { SchemaTypeList } from '../SchemaTypeAndField/SchemaTypeList';
import { SchemaTypeView } from '../SchemaTypeAndField/SchemaTypeView';
import { TypeDefFields } from '../TypeDefFields/TypeDefFields';

interface UIEditorProps {
  disabled: boolean;
}

export function UIEditor({ disabled }: UIEditorProps) {
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };
  const { setCurrentTypeName } = useDataModelState();
  const {
    createType,
    renameType,
    deleteType,
    createField,
    updateField,
    removeField,
  } = useTypeDefActions();
  const { currentTypeName, typeDefs } = useSelector((state) => state.dataModel);
  const customTypesNames = useCustomTypeNames(
    dataModelExternalId,
    version,
    space
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
                key="TypeDefFields"
                currentType={currentType}
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
