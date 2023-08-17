import styled from 'styled-components';

import { Body, Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';

import { AiSearchIcon } from './AiSearchIcon';

export const AISearchCategoryDropdown: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Dropdown
      content={
        <Menu style={{ minWidth: 540 }}>
          <Menu.Section label="Select a question type">
            <Menu.Item>
              <Flex>
                <Body size="small" style={{ flex: 1 }}>
                  {t('AI_HELP_ME_FIND')}...
                </Body>
                <AIChip>
                  <AiSearchIcon />
                  <Body size="x-small" style={{ flex: 1 }}>
                    {t('AI_HELP_ME_FIND_DESC')}
                  </Body>
                </AIChip>
              </Flex>
            </Menu.Item>
            <Menu.Item disabled>
              <Flex>
                <Body size="small" style={{ flex: 1 }}>
                  {t('AI_FIND_IN_FILES')} ({t('AI_COMING_SOON').toLowerCase()}
                  )...
                </Body>
                <AIChip>
                  <AiSearchIcon />
                  <Body size="x-small" style={{ flex: 1 }}>
                    {t('AI_FIND_IN_FILES_DESC')}
                  </Body>
                </AIChip>
              </Flex>
            </Menu.Item>
          </Menu.Section>
        </Menu>
      }
    >
      <Button type="ghost" icon="ChevronDown" iconPlacement="right">
        {t('AI_HELP_ME_FIND')}
      </Button>
    </Dropdown>
  );
};

const AIChip = styled(Flex)<{ $active?: boolean }>`
  background: var(--surface-status-ai-muted-default, rgba(111, 59, 228, 0.08));
  padding: 2px 4px;
  border-radius: 4px;
  align-items: center;
  gap: 2px;
`;
