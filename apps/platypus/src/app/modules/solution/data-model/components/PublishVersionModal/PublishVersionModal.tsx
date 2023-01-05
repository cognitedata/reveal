import { Body, Button, Flex, Input, Radio } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog';
import { USE_FDM_V3_LOCALSTORAGE_KEY } from '@platypus-app/constants';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { StorageProviderType } from '@platypus/platypus-core';
import { useState, useEffect } from 'react';
import { StyledBreakingChanges } from './elements';

export type VersionType = 'FIRST' | 'NON_BREAKING' | 'BREAKING';

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
    props.versionType !== 'BREAKING' ? true : false
  );
  const [error, setError] = useState('');

  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  const isFDMV3 = localStorageProvider.getItem(USE_FDM_V3_LOCALSTORAGE_KEY);

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
    if (version.length < 1 || version.length > 43) {
      setError(
        t(
          'custom_version_error_text',
          'Version length should be between 1-43 characters.'
        )
      );
      return;
    }

    if (
      props.versionType !== 'FIRST' &&
      props.publishedVersions.includes(`${version}`)
    ) {
      setError(
        t(
          'custom_version_error_text',
          'This version tag has already been used.'
        )
      );
      return;
    }

    const matchingPattern = isFDMV3
      ? /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,41}[a-zA-Z0-9]?$/
      : /^[1-9][0-9]{0,41}[0-9]?$/;
    if (!version.match(matchingPattern)) {
      setError(
        t(
          'custom_version_error_text',
          isFDMV3
            ? 'Allowed characters: a-z, A-Z, 0-9, _, -, .'
            : 'Please use numeric values greater than 0'
        )
      );
      return;
    }

    setError('');
  }, [version, t, isFDMV3, props.publishedVersions]);

  return (
    <ModalDialog
      visible={true}
      title={t('publish_dm_modal_title', 'Publish data model')}
      onCancel={props.onCancel}
      onOk={() => {
        const finalizedVersion = keepCurrentVersion
          ? props.currentVersion
          : version;
        props.onUpdate(
          !isFDMV3
            ? parseInt(finalizedVersion, 10).toString()
            : finalizedVersion
        );
      }}
      okButtonName={t('publish_new_version', 'Publish')}
      okProgress={props.isUpdating || props.isSaving}
      cancelHidden={props.isUpdating || props.isSaving}
      okDisabled={!!error}
      okType="primary"
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
              variant="ghost"
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
            type={'text'}
            fullWidth
            autoFocus
            value={version}
            onChange={(e) => setVersion(e.currentTarget.value)}
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
              onClick={() =>
                !props.breakingChanges && setKeepCurrentVersion(true)
              }
              data-cy={'keep-current-version-radio'}
            >
              {t('keep_version_text', 'Keep version')} {props.currentVersion}
            </Radio>
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
              onClick={() =>
                !props.breakingChanges && setKeepCurrentVersion(false)
              }
              data-cy={'create-new-version-radio'}
            >
              {t('create_new_version_text', 'Create new version')}
            </Radio>
            <Input
              type={'text'}
              fullWidth
              autoFocus
              value={version}
              onChange={(e) => setVersion(e.currentTarget.value)}
              disabled={
                (!props.breakingChanges && keepCurrentVersion) || !isFDMV3
              }
              variant={
                !props.breakingChanges && keepCurrentVersion
                  ? 'noBorder'
                  : 'default'
              }
              error={error || false}
              data-cy={'publish-new-version-input'}
            />
          </Flex>
        </>
      )}
    </ModalDialog>
  );
};
