import { trackEvent } from '@cognite/cdf-route-tracker';
import { Dropdown, Menu, TopbarExp, useBoolean } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

import { HelpResource, getHelpDropdownOptions } from './helpResources';

export const HelpCenter = () => {
  const { t } = useTranslation();
  const helpCenterOptions = getHelpDropdownOptions(t);

  const handleHelpClick = (helpResource: HelpResource) => {
    trackEvent('BusinessShell.HelpCenter.Click', {
      link: helpResource.link,
    });
    window.open(helpResource.link, '_blank');
  };

  const { value, toggle, setFalse } = useBoolean(false);
  return (
    <Dropdown
      visible={value}
      onClickOutside={setFalse}
      offset={[0, 8]}
      content={
        <Menu>
          {Object.keys(helpCenterOptions).map((helpOption) => {
            const helpResource =
              helpCenterOptions[helpOption as keyof typeof helpCenterOptions];
            return (
              <Menu.Item
                key={helpOption}
                icon={helpResource.icon}
                iconPlacement="left"
                onClick={() => handleHelpClick(helpResource)}
              >
                {helpResource.title}
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      <TopbarExp.Button
        onClick={toggle}
        toggled={value}
        icon="Help"
        type="ghost"
      />
    </Dropdown>
  );
};
