import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import {
  StyledArrowColumn,
  StyledMappingViewColumn,
  StyledMappingViewSection,
} from '@transformations/components/editor-section/MappingEditorView';
import FormFieldSelect from '@transformations/components/form-field-select';
import SchemaItem from '@transformations/components/target/SchemaItem';
import { useSchema } from '@transformations/hooks';
import { Destination, isFDMDestination } from '@transformations/types';

import { Flex, Icon } from '@cognite/cogs.js';

import { FieldSelectorProps } from './types';
import {
  getSchemaType,
  getTransformationMapping,
  isSourceSchemaCompatibleWithDestinationSchema,
} from './utils';

export default function CleanFieldSelector({
  transformation,
  from,
  to,
  update,
  disabled,
}: FieldSelectorProps) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);

  const source = { type: mapping?.sourceLevel2 } as unknown as Destination;

  const {
    data: destinationSchemas,
    isInitialLoading: loadingDestinationSchema,
  } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  const { data: sourceSchemas, isInitialLoading: loadingSourceSchema } =
    useSchema({ destination: source!, action: 'abort' }, { enabled: !!source });

  const destinationSchema = destinationSchemas?.find((s) => s.name === to);

  const options = useMemo(
    () =>
      sourceSchemas
        ?.filter((s) => {
          return isSourceSchemaCompatibleWithDestinationSchema(
            s,
            destinationSchema,
            isFDMDestination(transformation.destination)
          );
        })
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .map((s) => ({
          label: (
            <Flex justifyContent="space-between">
              <div>{s.name}</div>
              <div>{getSchemaType(s)}</div>
            </Flex>
          ),
          value: s.name,
        })),
    [destinationSchema, sourceSchemas, transformation.destination]
  );

  if (!destinationSchema || !sourceSchemas) {
    return null;
  }

  const loading = loadingSourceSchema || loadingDestinationSchema;

  return (
    <StyledMappingViewSection>
      <StyledMappingViewColumn>
        <FormFieldSelect<string>
          disabled={disabled}
          showSearch
          loading={loading}
          allowClear
          placeholder={t('source-menu-click-to-select-property')}
          onChange={(e) => update(e)}
          value={from ? from : undefined}
          options={options}
          notFoundContent={t('no-compatible-property-found')}
        />
      </StyledMappingViewColumn>
      <StyledArrowColumn>
        <Icon type="ArrowRight" />
      </StyledArrowColumn>
      <StyledMappingViewColumn>
        {loadingDestinationSchema ? (
          <Icon type="Loader" />
        ) : (
          <SchemaItem
            schema={destinationSchema}
            transformation={transformation}
          />
        )}
      </StyledMappingViewColumn>
    </StyledMappingViewSection>
  );
}
