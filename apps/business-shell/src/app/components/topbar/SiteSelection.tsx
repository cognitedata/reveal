import React from 'react';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { useProjectConfig } from '@flexible-data-explorer/app/hooks/useConfig';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useSelectedSiteLocalStorage } from '@flexible-data-explorer/app/hooks/useLocalStorage';

import {
  Avatar,
  Dropdown,
  Flex,
  Heading,
  Menu,
  Divider,
  TopbarExp,
  useBoolean,
  Chip,
} from '@cognite/cogs.js';

export const SiteSelection = () => {
  const config = useProjectConfig();
  const { value, toggle, setFalse } = useBoolean(false);

  const [selectedSite, setSelectedSite] = useSelectedSiteLocalStorage();

  if (!config?.sites && !config?.sites?.length) {
    return null;
  }

  return (
    <Dropdown
      visible={value}
      onClickOutside={setFalse}
      offset={[0, 18]}
      content={
        <Menu style={{ width: 288 }}>
          <Menu.Header>
            <Flex gap={10} alignItems="center">
              <Avatar text={config.company} />
              <Heading level={6}>{config.company}</Heading>
            </Flex>
          </Menu.Header>
          <Divider />
          <Menu.Section label="Sites">
            {config.sites.map((site) => (
              <Menu.Item
                onClick={() => setSelectedSite(site.name)}
                key={site.name}
              >
                {site.name}
              </Menu.Item>
            ))}
            {config?.showCustomSite ? (
              <Menu.Item onClick={() => setSelectedSite('Custom')}>
                Custom <Chip label="Development" size="x-small" />
              </Menu.Item>
            ) : (
              <React.Fragment />
            )}
          </Menu.Section>
        </Menu>
      }
    >
      <Flex>
        <TopbarExp.Button
          onClick={toggle}
          toggled={value}
          type="ghost"
          icon="ChevronDown"
          iconPlacement="right"
        >
          {selectedSite}
        </TopbarExp.Button>

        <Divider spacing="8px" direction="vertical" length="20px" />
      </Flex>
    </Dropdown>
  );
};
