import { useEffect, useState } from 'react';

import { DataModelVersionValidator } from '@platypus/platypus-core';

import { Body, Button, Flex, Input, Modal, Radio } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

import { StyledBreakingChanges } from './elements';

export type VersionType = 'FIRST' | 'SUBSEQUENT';

export interface PublishVersionModalProps {
  versionType: VersionType;
  currentVersion: string;
  suggestedVersion: string;
  publishedVersions: string[];
  breakingChanges: string;
  isUpdating: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onUpdate: (newVersion: string) => void;
}

export const PublishVersionModal = (props: PublishVersionModalProps) => {
  const { t } = useTranslation('SolutionPublishVersionModal');
  const [version, setVersion] = useState(props.suggestedVersion);
  const [keepCurrentVersion, setKeepCurrentVersion] = useState(
    !props.breakingChanges && props.versionType !== 'FIRST'
  );
  const [error, setError] = useState('');

  const MINIMUM_CHANGES_VISIBLE = 4;
  const [showAllChanges, setShowAllChanges] = useState(false);
  const breakingChangesLines = props.breakingChanges
    .split('\n')
    .filter((line) => line !== '' && !line.startsWith('Breaking change'));
  const getLessBreakingChangesLines = () => {
    if (breakingChangesLines.length < 1) return [];
    if (breakingChangesLines.length < MINIMUM_CHANGES_VISIBLE)
      return breakingChangesLines.slice(0, breakingChangesLines.length);
    return breakingChangesLines.slice(0, MINIMUM_CHANGES_VISIBLE);
  };

  useEffect(() => {
    if (
      props.versionType !== 'FIRST' &&
      props.publishedVersions.includes(`${version}`)
    ) {
      setError(
        t(
          'publish_data_model_version_already_exists_error_message',
          'Version already exists'
        )
      );
      return;
    }

    const validator = new DataModelVersionValidator();

    const validationResult = validator.validate('version', version);

    if (!validationResult.valid) {
      setError(validationResult.errors.version);
      return;
    }

    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, t, props.publishedVersions]);

  return (
    <Modal
      visible={true}
      title={t('publish_dm_modal_title', 'Publish data model')}
      onCancel={props.onCancel}
      onOk={() => {
        const finalizedVersion = keepCurrentVersion
          ? props.currentVersion
          : version;
        props.onUpdate(finalizedVersion);
      }}
      okText={t('publish_new_version', 'Publish')}
      okDisabled={props.isUpdating || props.isSaving || !!error}
      icon={props.isUpdating || props.isSaving ? 'Loader' : undefined}
    >
      {props.breakingChanges && (
        <StyledBreakingChanges data-cy="breaking-changes-container">
          Breaking change(s) since last published version (
          {breakingChangesLines.length}):
          <br />
          {showAllChanges
            ? breakingChangesLines.join('\n')
            : getLessBreakingChangesLines().join('\n')}
          <br />
          {breakingChangesLines.length > MINIMUM_CHANGES_VISIBLE && (
            <Button
              type="ghost"
              iconPlacement="right"
              icon={showAllChanges ? 'ChevronUp' : 'ChevronDown'}
              style={{ marginLeft: '-8px' }}
              onClick={() => setShowAllChanges(!showAllChanges)}
            >
              {showAllChanges
                ? t('see_all_btn_text', 'See less')
                : t('see_all_btn_text', 'See all')}
            </Button>
          )}
        </StyledBreakingChanges>
      )}

      {props.versionType === 'FIRST' && (
        <>
          <Body strong style={{ paddingBottom: '6px' }}>
            {t('publish_version_title', 'Version to be published')}
          </Body>
          <Input
            type="text"
            fullWidth
            autoFocus
            value={version}
            onChange={(e: any) => setVersion(e.currentTarget.value)}
            error={error || false}
          />
        </>
      )}

      {props.versionType !== 'FIRST' && (
        <>
          <Body strong style={{ paddingBottom: '6px' }}>
            {t('publish_version_title', 'Version to be published')}
          </Body>
          <Flex style={{ marginTop: '12px' }}>
            <Radio
              checked={!props.breakingChanges && keepCurrentVersion}
              value={`${props.currentVersion}`}
              disabled={!!props.breakingChanges}
              onChange={() =>
                !props.breakingChanges && setKeepCurrentVersion(true)
              }
              data-cy="keep-current-version-radio"
              name="keep-current-version-radio"
              label={`${t('keep_version_text', 'Keep version')} ${
                props.currentVersion
              }`}
            />
          </Flex>
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            style={{ marginTop: '8px' }}
          >
            <Radio
              checked={!keepCurrentVersion}
              value={`${version}`}
              style={{ flexShrink: 0, paddingRight: '16px', marginTop: '7px' }}
              onChange={() =>
                !props.breakingChanges && setKeepCurrentVersion(false)
              }
              data-cy="create-new-version-radio"
              name="create-new-version-radio"
              label={t('create_new_version_text', 'Create new version')}
            />
            <Input
              type="text"
              fullWidth
              autoFocus
              value={version}
              onChange={(e: any) => setVersion(e.currentTarget.value)}
              disabled={!props.breakingChanges && keepCurrentVersion}
              variant={
                !props.breakingChanges && keepCurrentVersion
                  ? 'noBorder'
                  : 'default'
              }
              error={error || false}
              data-cy="publish-new-version-input"
            />
          </Flex>
        </>
      )}
    </Modal>
  );
};
