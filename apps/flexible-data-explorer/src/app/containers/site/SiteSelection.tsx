import React, { PropsWithChildren } from 'react';

import { Dropdown, Flex, Menu, useBoolean, Chip } from '@cognite/cogs.js';

import { useProjectConfig } from '../../hooks/useConfig';
import { useSelectedSiteLocalStorage } from '../../hooks/useLocalStorage';

export const SiteSelection: React.FC<PropsWithChildren> = ({ children }) => {
  const config = useProjectConfig();
  const { value, toggle, setFalse } = useBoolean(false);

  const [, setSelectedSite] = useSelectedSiteLocalStorage();

  if (!config?.sites && !config?.sites?.length) {
    return null;
  }

  return (
    <Dropdown
      visible={value}
      onClickOutside={setFalse}
      content={
        <Menu style={{ width: 288 }} data-testid="site-selection-menu">
          <Menu.Section label="Sites">
            {config.sites.map((site) => (
              <Menu.Item
                onClick={() => setSelectedSite(site.name)}
                key={site.name}
              >
                {site.name}
              </Menu.Item>
            ))}
            {config?.showCustomSite && (
              <Menu.Item onClick={() => setSelectedSite('Custom')}>
                Custom <Chip label="Development" size="x-small" />
              </Menu.Item>
            )}
          </Menu.Section>
        </Menu>
      }
    >
      <Flex className="orientation-site-selection" onClick={() => toggle()}>
        {children}
      </Flex>
    </Dropdown>
  );
};
