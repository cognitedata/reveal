import { useState, useCallback } from 'react';

import { useTranslation } from '@transformations/common';
import {
  useTransformationContext,
  PreviewSourceLimit,
} from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import {
  getContainer,
  getTrackEvent,
  getQueryPreviewTabTitle,
} from '@transformations/utils';
import { PREVIEW_SOURCE_LIMIT_OPTIONS } from '@transformations/utils/constants';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';

type PreviewButtonProps = {
  transformation: TransformationRead;
};

const PreviewButton = ({ transformation }: PreviewButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const { addTab, localSqlQuery, setActiveInspectSectionKey } =
    useTransformationContext();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleRunPreview = useCallback(
    (query: string, previewSourceLimit: PreviewSourceLimit) => {
      const now = new Date();
      addTab({
        key: `preview-${now.getTime()}`,
        type: 'preview',
        title: getQueryPreviewTabTitle(now),
        limit: 1000,
        sourceLimit: previewSourceLimit,
        query,
        transformationId: transformation.id,
      });
      setActiveInspectSectionKey('preview');
    },
    [addTab, setActiveInspectSectionKey, transformation.id]
  );

  return (
    <Flex gap={8}>
      <Dropdown
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
        appendTo={getContainer()}
        content={
          <Menu>
            <Menu.Header>{t('source-limit')}</Menu.Header>
            {PREVIEW_SOURCE_LIMIT_OPTIONS.map((value) => (
              <Menu.Item
                key={`preview-${value}`}
                onClick={() => {
                  trackEvent(
                    getTrackEvent(
                      'event-tr-details-query-preview-limit-click'
                    ).replace('{{limit}}', `${value}`)
                  );
                  handleRunPreview(localSqlQuery, value);
                  setDropdownVisible(!dropdownVisible);
                }}
              >
                {value === -1 ? t('all') : value}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Button icon="ChevronDown" iconPlacement="right">
          {t('details-editor-preview-button')}
        </Button>
      </Dropdown>
    </Flex>
  );
};

export default PreviewButton;
