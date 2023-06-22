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
import { useModel } from '@transformations/hooks/fdm';
import { isFDMDestination } from '@transformations/types';

import { Flex, Icon } from '@cognite/cogs.js';

import { FieldSelectorProps } from './types';
import {
  getSchemaType,
  getTransformationMapping,
  isSourceSchemaCompatibleWithDestinationSchema,
} from './utils';

export default function FDMFieldSelector({
  transformation,
  from,
  to,
  update,
  disabled,
}: FieldSelectorProps) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);

  const [space, dataModelExternalId, version] =
    mapping?.sourceLevel1?.split('.') || [];

  const { data: model } = useModel(dataModelExternalId, space, version);

  const selectedView = useMemo(() => {
    return model?.views.find(
      ({ externalId: e }) => e === mapping?.sourceLevel2
    );
  }, [mapping?.sourceLevel2, model?.views]);

  const { data: destinationSchemas } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  const { data: sourceSchemas, isInitialLoading } = useSchema(
    {
      destination: {
        type: 'nodes', // we only support nodes as source atm
        instanceSpace: space,
        view: {
          externalId: selectedView?.externalId!,
          version: selectedView?.version!,
          space: selectedView?.space!,
        },
      },
      action: 'abort',
    },
    {
      enabled: !!selectedView,
    }
  );

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

  return (
    <StyledMappingViewSection>
      <StyledMappingViewColumn>
        <FormFieldSelect<string>
          disabled={disabled}
          allowClear
          showSearch
          loading={isInitialLoading}
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
        <SchemaItem
          schema={destinationSchema}
          transformation={transformation}
        />
      </StyledMappingViewColumn>
    </StyledMappingViewSection>
  );
}
