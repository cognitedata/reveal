import styled from 'styled-components';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Button, Icon, Menu, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../i18n';
import { getHelpCenterOptions } from '../../../../utils/helpResources';
import { getContainer } from '../../../../utils/utils';

type CDFHelpCenterProps = {
  isRockwellDomain: boolean;
};

const CDFHelpCenter = ({
  isRockwellDomain,
}: CDFHelpCenterProps): JSX.Element => {
  const { t } = useTranslation();

  const helpCenterOptions = getHelpCenterOptions(t, isRockwellDomain);

  return (
    <>
      <Dropdown
        appendTo={() => getContainer()}
        placement="bottom-end"
        content={
          <Menu>
            {Object.keys(helpCenterOptions).map((helpOption) => {
              const helpResource =
                helpCenterOptions[helpOption as keyof typeof helpCenterOptions];
              return (
                <StyledHelpCenterMenuOption
                  key={helpOption}
                  href={helpResource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent('Navigation.HelpCenter', {
                      link: helpResource.link,
                    })
                  }
                >
                  <Menu.Item>
                    <StyledIcon type={helpResource.icon} />
                    {helpResource.title}
                  </Menu.Item>
                </StyledHelpCenterMenuOption>
              );
            })}
          </Menu>
        }
      >
        <StyledHelpCenterButton icon="Help" type="ghost" inverted />
      </Dropdown>
    </>
  );
};

const StyledHelpCenterMenuOption = styled.a`
  align-items: center;
  color: inherit;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;

  & span {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const StyledIcon = styled(Icon)`
  margin-right: 0;
`;

const StyledHelpCenterButton = styled(Button)`
  line-height: unset;
`;

export default CDFHelpCenter;
