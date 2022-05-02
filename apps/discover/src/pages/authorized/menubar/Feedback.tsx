import * as React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Dropdown, Menu, TopBar } from '@cognite/cogs.js';
import { intercomHelper } from '@cognite/intercom-helper';

import GeneralFeedback from 'components/Modals/general-feedback';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

const MenuContainer = styled.div``;

interface ChatModel {
  id: string;
  value: string;
  onClick: () => void;
}

export const Feedback: React.FC = () => {
  const { t } = useTranslation('global');
  const metrics = useGlobalMetrics('topbar');
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);

  const contactMenuItems: ChatModel[] = [
    {
      id: 'feedback',
      value: t('Feedback'),
      onClick: () => setFeedbackIsVisible(true),
    },
    {
      id: 'help',
      value: t('Help'),
      onClick: () => {
        intercomHelper.show(true);
      },
    },
  ];

  const handleFeedbackIconClick = () => {
    setShowDropdown(true);
    metrics.track('click-feedback-icon-button');
  };

  const MenuContent = (
    <MenuContainer>
      {showDropdown && (
        <Menu>
          {contactMenuItems.map((item) => (
            <Menu.Item
              key={item.id}
              onClick={() => {
                metrics.track(`click-${item.value.toLowerCase()}-menu-item`);
                item.onClick();
                setShowDropdown(false);
              }}
            >
              {item.value}
            </Menu.Item>
          ))}
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
