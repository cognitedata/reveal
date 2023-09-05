import { StoryFn } from '@storybook/react';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { translations } from '../../common';

import PropertySelector from './PropertySelector';

export default {
  title: 'Components/PropertySelector Story',
  component: PropertySelector,
};

export const PropertySelectorStory: StoryFn = () => (
  <I18nWrapper
    translations={translations}
    defaultNamespace="industry-canvas-ui"
  >
    <PropertySelector
      propertiesList={[
        [
          { path: 'externalId', value: '1234', isSelected: false },
          { path: 'name', value: 'Test Name', isSelected: true },
          { path: 'description', value: 'Test Description', isSelected: true },
          { path: 'type', value: 'Pump', isSelected: false },
          { path: 'metadata.pressure', value: '9000 PSI', isSelected: false },
          {
            path: 'metadata.processing_power',
            value: '9000 PSI',
            isSelected: false,
          },
        ],
        [
          { path: 'externalId', value: '1234', isSelected: false },
          { path: 'name', value: 'Test Name', isSelected: false },
          { path: 'type', value: 'Valve', isSelected: false },
          {
            path: 'metadata.part_number',
            value: '#123K41J',
            isSelected: false,
          },
          { path: 'metadata.temperature', value: '250C ', isSelected: false },
          { path: 'metadata.FLOW_RATE', value: '250C ', isSelected: false },
          { path: 'metadata.model_number', value: '129PT ', isSelected: false },
          { path: 'metadata.vendor', value: '250C ', isSelected: false },
          {
            path: 'metadata.productionYear',
            value: '1990 ',
            isSelected: false,
          },
          { path: 'metadata.firstUseYear', value: '1992 ', isSelected: false },
        ],
      ]}
      onApplyClick={(properties) => console.log('onApplyClick', properties)}
    />
  </I18nWrapper>
);

export const PropertySelectorOverflowStory: StoryFn = () => (
  <I18nWrapper
    translations={translations}
    defaultNamespace="industry-canvas-ui"
  >
    <PropertySelector
      propertiesList={[
        [
          {
            path: 'exte rnalIde xternalIdexternalIdexternalIdexternalIdexternalId',
            value:
              '123412341234123412341234123412341234123412341234123412341234',
            isSelected: false,
          },
          {
            path: 'namenamenamenamenamenamenamenamenamenamename',
            value:
              'Test NameTest NameTest NameTest NameTest NameTest NameTest NameTest NameTest NameTest NameTest Name',
            isSelected: false,
          },
          {
            path: 'descriptiondescriptiondescriptiondescriptiondescription',
            value:
              'Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description',
            isSelected: false,
          },
          { path: 'type', value: 'Pump', isSelected: false },
          { path: 'metadata.pressure', value: '9000 PSI', isSelected: false },
          {
            path: 'metadata.processing_power',
            value: '9000 PSI',
            isSelected: false,
          },
        ],
        [
          {
            path: 'metadata.FLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATEFLOW_RATE',
            value: '250C ',
            isSelected: false,
          },
          {
            path: 'metadata.model_number',
            value:
              '129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT ',
            isSelected: false,
          },
          {
            path: 'metadata.sub-model-number',
            value:
              '129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT129PT ',
            isSelected: false,
          },
        ],
      ]}
      onApplyClick={(properties) => console.log('onApplyClick', properties)}
    />
  </I18nWrapper>
);

PropertySelectorStory.args = {};
