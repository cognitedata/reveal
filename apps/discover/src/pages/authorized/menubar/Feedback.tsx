import * as React from 'react';

import styled from 'styled-components/macro';

import { Dropdown, Menu, TopBar, A, Icon, Flex } from '@cognite/cogs.js';

import GeneralFeedback from 'components/Modals/general-feedback';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';

export const ZENDESK_ENDPOINT =
  'https://cognite.zendesk.com/hc/en-us/requests/new';
const MenuContainer = styled.div``;

export const Feedback: React.FC = () => {
  const { t } = useTranslation('global');
  const metrics = useGlobalMetrics('topbar');
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);

  const handleFeedbackIconClick = () => {
    setShowDropdown(true);
    metrics.track('click-feedback-icon-button');
  };

  const MenuContent = (
    <MenuContainer>
      {showDropdown && (
        <Menu>
          <Menu.Item
            key="feedback"
            onClick={() => {
              metrics.track(`click-feedback-menu-item`);
              setFeedbackIsVisible(true);
              setShowDropdown(false);
            }}
          >
            {t('Feedback')}
          </Menu.Item>
          <Menu.Item
            key="support"
            onClick={() => {
              metrics.track(`click-help-menu-item`);
              setShowDropdown(false);
            }}
          >
            <A
              href={ZENDESK_ENDPOINT}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Flex alignItems="center">
                {t('Support')}
                <Icon
                  type="ArrowUpRight"
                  style={{ marginRight: 0, marginLeft: '4px' }}
                />
              </Flex>
            </A>
          </Menu.Item>
        </Menu>
      )}
    </MenuContainer>
  );

  return (
    <>
      <Dropdown content={MenuContent} appendTo={document.body}>
        <TopBar.Action
          icon="Help"
          onClick={handleFeedbackIconClick}
          aria-label="Help"
        />
      </Dropdown>
      {feedbackIsVisible && (
        <GeneralFeedback
          visible={feedbackIsVisible}
          onCancel={() => setFeedbackIsVisible(false)}
        />
      )}
    </>
  );
};
