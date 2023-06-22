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
import { useQuickProfile } from '@transformations/hooks/profiling-service';
import { isFDMDestination } from '@transformations/types';

import { Flex, Icon } from '@cognite/cogs.js';

import { FieldSelectorProps } from './types';
import {
  getTransformationMapping,
  isSourceColumnCompatibleWithDestinationSchema,
} from './utils';

export default function RawFieldSelector({
  transformation,
  from,
  to,
  update,
  disabled,
}: FieldSelectorProps) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);
  const database = mapping?.sourceLevel1;
  const table = mapping?.sourceLevel2;

  const { data: rawProfile, isInitialLoading: loadingProfile } =
    useQuickProfile(
      {
        database: database!,
        table: table!,
      },
      { enabled: !!database && !!table }
    );

  const { data: destinationSchemas, isInitialLoading: loadingSchema } =
    useSchema({
      destination: transformation.destination,
      action: transformation.conflictMode,
    });

  const destinationSchema = destinationSchemas?.find((s) => s.name === to);

  const options = useMemo(
    () =>
      rawProfile?.columns
        ?.filter((c) => {
          return isSourceColumnCompatibleWithDestinationSchema(
            c,
            destinationSchema,
            isFDMDestination(transformation.destination)
          );
        })
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((s) => ({
          label: (
            <Flex justifyContent="space-between">
              <div>{s.label}</div>
              <div>{s.type}</div>
            </Flex>
          ),
          value: s.label,
        })),
    [destinationSchema, rawProfile?.columns, transformation.destination]
  );

  if (!destinationSchema) {
    return null;
  }

  return (
    <StyledMappingViewSection>
      <StyledMappingViewColumn>
        <FormFieldSelect<string>
          allowNewItem
          disabled={disabled}
          allowClear
          showSearch
          loading={loadingSchema || loadingProfile}
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
        {loadingSchema ? (
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
