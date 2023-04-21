import { useState } from 'react';

import { Select } from 'antd';
import styled from 'styled-components';
import { Body, Button, Flex, InputExp, Modal } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { ExtractorWithReleases } from 'service/extractors';

import { OptionType } from '@cognite/cogs.js';
import { FormField } from 'components/form-field/FormField';

const maxStep = 2;

type ConnectToHostedExtractorModalProps = {
  extractor: ExtractorWithReleases;
  onCancel: VoidFunction;
  visible: boolean;
};

type TopicFilters = Record<string, string>;

type ConnectionValuesForm = {
  connectionName: string;
  description?: string;
  hostName: string;
  username: string;
  password: string;
  protocolVersion: OptionType<string>;
  externalId: string;
  topicFilterInput: string;
  topicFilters: TopicFilters;
};

const protocolVersions: OptionType<string>[] = [
  {
    label: 'Version 5',
    value: 'Version 5',
  },
  { label: 'Version 3.1.1', value: 'Version 3.1.1' },
];

const defaultValues: ConnectionValuesForm = {
  connectionName: '',
  description: '',
  hostName: '',
  username: '',
  password: '',
  protocolVersion: protocolVersions[0],
  externalId: '',
  topicFilterInput: '',
  topicFilters: {},
};

/** Checks if all the required values for a specific step in the form contains valid values. */
const canContinueSetup = (
  values: ConnectionValuesForm,
  step: number
): boolean => {
  const autorisationStepCompleted =
    !!values.connectionName.trim() &&
    !!values.hostName.trim() &&
    !!values.password.trim() &&
    !!values.protocolVersion &&
    !!values.externalId.trim();
  const topicFiltersStepCompleted =
    Object.keys(values.topicFilters)?.length > 0;

  if (step === 1) {
    return autorisationStepCompleted;
  }
  if (step === 2) {
    return autorisationStepCompleted && topicFiltersStepCompleted;
  }
  return false;
};

export const ConnectToHostedExtractorModal = ({
  extractor,
  onCancel,
  visible,
}: ConnectToHostedExtractorModalProps) => {
  const { t } = useTranslation();

  const [values, setValues] = useState(defaultValues);
  const [currentStep, setCurrentStep] = useState(1);

  const canContinue = canContinueSetup(values, currentStep);
  const hasTopicFilterToAdd = !!values.topicFilterInput.trim();

  const onAdvancePress = () => {
    if (currentStep === maxStep) {
      // TODO start some calls here
    }
    if (currentStep < maxStep) {
      setCurrentStep((state) => state + 1);
    }
  };

  const onAddTopicFilter = () => {
    const newKey = `${Math.random()}-${values.topicFilterInput}`;

    setValues((state) => ({
      ...state,
      topicFilters: { ...state.topicFilters, [newKey]: state.topicFilterInput },
      topicFilterInput: '',
    }));
  };

  const onRemoveTopicFilter = (topicFilterKey: string) => {
    const { [topicFilterKey]: _id, ...newTopicFilters } = values.topicFilters;

    setValues((state) => ({
      ...state,
      topicFilters: newTopicFilters,
    }));
  };

  const onModifyTopicFilter = (topicFilterKey: string, value: string) => {
    if (!value.trim()) {
      // Remove the topic filter completely
      onRemoveTopicFilter(topicFilterKey);
    } else {
      // Modify the selected filter
      setValues((state) => ({
        ...state,
        topicFilters: { ...state.topicFilters, [topicFilterKey]: value },
      }));
    }
  };

  return (
    <Modal
      visible={visible}
      subtitle={
        currentStep === maxStep ? t('topic-filters') : t('authorisation')
      }
      chip="Settings"
      title={t('connect-cdf-to', { extractor: extractor?.name })}
      onCancel={onCancel}
      hideFooter
    >
      <Flex direction="column" gap={16}>
        {currentStep === 1 && (
          <>
            <InputExp
              label={{
                required: true,
                info: undefined,
                text: t('form-connection-name'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((state) => ({
                  ...state,
                  connectionName: e.target.value,
                }))
              }
              placeholder={t('form-connection-name-placeholder')}
              value={values.connectionName}
            />
            <InputExp
              label={{
                required: false,
                info: undefined,
                text: t('form-description'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((state) => ({
                  ...state,
                  description: e.target.value,
                }))
              }
              placeholder={t('form-description-placeholder')}
              value={values.description}
            />
            <InputExp
              label={{
                required: true,
                info: undefined,
                text: t('form-external-id'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((values) => ({
                  ...values,
                  externalId: e.target.value,
                }))
              }
              placeholder={t('form-external-id-placeholder')}
              value={values.externalId}
            />
            <InputExp
              label={{
                required: true,
                info: undefined,
                text: t('form-host-name'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((state) => ({
                  ...state,
                  hostName: e.target.value,
                }))
              }
              placeholder={t('form-host-name-placeholder')}
              value={values.hostName}
            />
            <FormField isRequired title={t('form-protocol-version')}>
              <Select
                onChange={(e) =>
                  setValues((state) => ({
                    ...state,
                    protocolVersion: e,
                  }))
                }
                options={protocolVersions}
                placeholder={t('form-protocol-version-placeholder')}
                value={values.protocolVersion}
              />
            </FormField>
            <InputExp
              label={{
                required: true,
                info: undefined,
                text: t('form-username'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((state) => ({
                  ...state,
                  username: e.target.value,
                }))
              }
              placeholder={t('form-username-placeholder')}
              value={values.username}
            />
            <InputExp
              label={{
                required: true,
                info: undefined,
                text: t('form-password'),
              }}
              fullWidth
              clearable
              onChange={(e) =>
                setValues((state) => ({
                  ...state,
                  password: e.target.value,
                }))
              }
              placeholder={t('form-password-placeholder')}
              value={values.password}
            />
          </>
        )}

        {/* Inputs for the Topic filters step */}
        {currentStep === maxStep && (
          <>
            <Flex gap={8} alignItems="flex-end" style={{ width: '100%' }}>
              <div style={{ flex: 1 }}>
                <InputExp
                  label={{
                    info: t('form-topic-filters-info'),
                    required: true,
                    text: t('topic-filters'),
                  }}
                  autoFocus
                  fullWidth
                  onChange={(e) =>
                    setValues((state) => ({
                      ...state,
                      topicFilterInput: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && hasTopicFilterToAdd) {
                      onAddTopicFilter();
                    }
                  }}
                  placeholder={t('form-topic-filters-placeholder')}
                  value={values.topicFilterInput}
                />
              </div>
              <Button
                disabled={!hasTopicFilterToAdd}
                onClick={onAddTopicFilter}
                type="primary"
              >
                {t('add')}
              </Button>
            </Flex>
            <TopicFiltersList direction="column" gap={8}>
              {Object.keys(values.topicFilters).map((topicFilterKey) => {
                return (
                  <InputExp
                    variant="solid"
                    fullWidth
                    clearable
                    key={topicFilterKey}
                    onChange={(e) =>
                      onModifyTopicFilter(topicFilterKey, e.target.value)
                    }
                    placeholder={t('form-topic-filters-placeholder')}
                    value={values.topicFilters[topicFilterKey]}
                  />
                );
              })}
            </TopicFiltersList>
          </>
        )}
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap={8}>
            {currentStep === maxStep && (
              <Button
                aria-label={'Go back one step'}
                icon={'ArrowLeft'}
                onClick={() => setCurrentStep((state) => state - 1)}
                type="secondary"
              ></Button>
            )}
            <Body level={3} strong muted>
              {t('step-count', { current: currentStep, max: maxStep })}
            </Body>
          </Flex>

          <Flex gap={8}>
            <Button onClick={onCancel} type="ghost">
              {t('cancel')}
            </Button>
            <Button
              disabled={!canContinue}
              onClick={onAdvancePress}
              type="primary"
            >
              {currentStep === maxStep ? t('create') : t('next')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};

const TopicFiltersList = styled(Flex)`
  max-height: 500px;
  overflow: auto;
  .cogs-input {
    overflow: auto;
    background: var(--cogs-surface--action--muted--default);
    color: var(--cogs-text-icon--medium);
  }
`;
