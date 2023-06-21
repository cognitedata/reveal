import React, { useMemo } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import FormFieldSelect from '@transformations/components/form-field-select';
import FormFieldSelectOption from '@transformations/components/form-field-select/FormFieldSelectOption';
import {
  ConnectionDefinition,
  DataModel,
  DMSSpace,
  isConnectionDefinition,
  useModels,
  useSpaces,
  ViewDefinition,
} from '@transformations/hooks/fdm';
import { flattenFDMModels } from '@transformations/utils';
import { getSelectedModel } from '@transformations/utils/fdm';
import { Select } from 'antd';
import { FormikProps } from 'formik';

import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

import { TransformationDestinationFormValues } from '.';

const { Option } = Select;

type FDMDestinationFormProps = {
  formik: FormikProps<TransformationDestinationFormValues>;
};

type TypeOptionConnectionDefinition = ConnectionDefinition & {
  propertyKey: string;
};

type TypeOption = {
  view: ViewDefinition;
  connectionDefinitions: TypeOptionConnectionDefinition[];
};

const FDMDestinationForm = ({
  formik,
}: FDMDestinationFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: modelsData } = useModels();

  const { data: spacesData } = useSpaces();

  const { errors, setFieldValue, values } = formik;

  const models = useMemo(
    () =>
      flattenFDMModels(
        modelsData?.pages.reduce(
          (accl, p) => [...accl, ...p.items],
          [] as DataModel[]
        ) || []
      ),
    [modelsData]
  );

  const spaces = useMemo(() => {
    return (
      spacesData?.pages
        .reduce((accl, p) => [...accl, ...p.items], [] as DMSSpace[])
        .sort((a, b) => a.space.localeCompare(b.space)) || []
    );
  }, [spacesData]);

  const selectedModel = useMemo(() => {
    return getSelectedModel(models, {
      externalId: values.model,
      space: values.dataModelSpace,
    });
  }, [models, values.model, values.dataModelSpace]);

  const typeOptions: TypeOption[] = useMemo(() => {
    const selectedVersion = selectedModel?.versions.find(
      ({ version }) => version === values.dataModelVersion
    );
    return (
      selectedVersion?.views.map((view) => {
        const connectionDefinitions: TypeOptionConnectionDefinition[] = [];
        Object.entries(view.properties).forEach(([propertyKey, property]) => {
          if (isConnectionDefinition(property)) {
            connectionDefinitions.push({ ...property, propertyKey });
          }
        });
        return {
          view,
          connectionDefinitions,
        };
      }) ?? []
    );
  }, [selectedModel, values.dataModelVersion]);

  return (
    <>
      <FormFieldSelect<TransformationDestinationFormValues['instanceSpace']>
        allowClear
        error={errors.instanceSpace}
        onChange={(value) => {
          setFieldValue('instanceSpace', value);
        }}
        placeholder={t('fdm-space-placeholder')}
        showSearch
        title={t('fdm-space')}
        value={values.instanceSpace}
        infoTooltip={
          <span>
            {t('space-title-tooltip-text')} <br />
            <br />
            <StyledLink
              href="https://docs.cognite.com/cdf/data_modeling/"
              target="_blank"
            >
              {t('spaces-docs-link-text')}
            </StyledLink>
          </span>
        }
      >
        {spaces.map(({ space }) => (
          <Option key={space} label={space} value={space}>
            <FormFieldSelectOption icon="Folder" label={space} />
          </Option>
        ))}
      </FormFieldSelect>
      {values.dataModelVersion && (
        <FormFieldSelect<TransformationDestinationFormValues['viewExternalId']>
          allowClear
          error={errors.viewExternalId || errors.connectionDefinitionProperty}
          isRequired
          onChange={(value) => {
            if (!value) {
              return;
            }

            const [viewExternalId, connectionDefinitionProperty] =
              value.split('.');

            setFieldValue('viewExternalId', viewExternalId);
            setFieldValue(
              'connectionDefinitionProperty',
              connectionDefinitionProperty
            );
          }}
          optionFilterProp="label"
          placeholder={t('fdm-view-placeholder')}
          showSearch
          title={t('fdm-view')}
          value={
            values.connectionDefinitionProperty
              ? `${values.viewExternalId}.${values.connectionDefinitionProperty}`
              : values.viewExternalId
          }
        >
          {typeOptions.map(({ view, connectionDefinitions }) => (
            <React.Fragment key={`type-option-group-${view.externalId}`}>
              <Select.Option label={view.externalId} value={view.externalId}>
                <Flex alignItems="center" gap={8}>
                  <Icon
                    type="SidebarRight"
                    css={{ transform: 'rotate(-90deg)' }}
                  />
                  <Flex alignItems="center">{view.externalId}</Flex>
                </Flex>
              </Select.Option>
              {connectionDefinitions.map((connectionDefinition) => (
                <Select.Option
                  key={`${view.externalId}.${connectionDefinition.propertyKey}`}
                  label={`${view.externalId}.${connectionDefinition.propertyKey} -> ${connectionDefinition.source.externalId} (${connectionDefinition.type.externalId})`}
                  value={`${view.externalId}.${connectionDefinition.propertyKey}`}
                >
                  <Flex alignItems="center" gap={8}>
                    <Icon type="VectorLine" />
                    <Flex alignItems="center">
                      {view.externalId}.{connectionDefinition.propertyKey}
                    </Flex>
                    <Icon
                      type={
                        connectionDefinition.direction === 'outwards'
                          ? 'ArrowRight'
                          : 'ArrowLeft'
                      }
                    />
                    <Flex alignItems="center">
                      {connectionDefinition.source.externalId}
                      &nbsp;
                      <MutedBody level={2}>
                        ({connectionDefinition.type.externalId})
                      </MutedBody>
                    </Flex>
                  </Flex>
                </Select.Option>
              ))}
            </React.Fragment>
          ))}
        </FormFieldSelect>
      )}
    </>
  );
};

const StyledLink = styled.a`
  color: ${Colors['text-icon--on-contrast--strong']};
  text-decoration: underline;
  &:hover {
    color: ${Colors['text-icon--on-contrast--strong']};
  }
`;

const MutedBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

export default FDMDestinationForm;
