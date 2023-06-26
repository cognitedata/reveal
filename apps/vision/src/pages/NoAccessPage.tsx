import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Graphic, GraphicOptions } from '@vision/assets/Graphics/Graphic';
import * as NavLinks from '@vision/constants/NavLinks';
import { AccessPermission } from '@vision/utils/types';

import { Body, Button, Title } from '@cognite/cogs.js';

type Props = {
  capabilities: Array<AccessPermission>;
  requestedPathName: string;
};

const getPrerequisiteList = (capabilities: Array<AccessPermission>) =>
  capabilities.map(({ acl, actions }) => {
    const formatedKey = acl.charAt(0).toUpperCase() + acl.slice(1);
    return actions.map((action) => (
      <li key={action}>
        {formatedKey}:{action}
      </li>
    ));
  });

const getPageTitle = (requestedPathName: string) => {
  const requestedPage = requestedPathName.split('/').pop();
  switch (requestedPage) {
    case 'explore':
      return 'Image and video management';
    case 'process':
      return 'Contextualize Imagery Data';
    case 'models':
      return 'Vision AutoML';
    default:
      return '';
  }
};

export default function NoAccessPage({
  capabilities,
  requestedPathName,
}: Props) {
  const navigate = useNavigate();
  const onBackButtonClick = useCallback(() => {
    navigate('/vision');
  }, [navigate]);
  return (
    <>
      <HomeButton>
        <Button
          type="ghost"
          icon="ArrowLeft"
          iconPlacement="left"
          onClick={onBackButtonClick}
        >
          Home
        </Button>
      </HomeButton>
      <Frame>
        <div>
          <TitleContainer>
            <Title level={2}>
              Request access to {getPageTitle(requestedPathName)}
            </Title>
          </TitleContainer>
          <BodyContainer>
            <Body level={1}>
              You don’t have an access to view this page yet. Check the access
              rights needed below:
            </Body>
          </BodyContainer>
          <Infobox>
            <ListContainer>
              <Body level={2} style={{ color: '#4255bb' }} strong>
                It is prerequisite to have:
                <UnorderedList>
                  {getPrerequisiteList(capabilities)}
                </UnorderedList>
              </Body>
            </ListContainer>
          </Infobox>
          <BodyContainer>
            <Body level={1}>
              Ask those responsible within your organisation for access
              management to grant them to you.
              <br /> <br />
              Learn more about access management in{' '}
              <a
                href={NavLinks.AccessManagementDoc}
                target="_blank"
                rel="noreferrer"
              >
                documentation.
              </a>
            </Body>
          </BodyContainer>
        </div>
        <GraphicContainer>
          <Graphic type={GraphicOptions.Search} />
        </GraphicContainer>
      </Frame>
    </>
  );
}

const HomeButton = styled.div`
  /* Auto Layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;

  position: absolute;
  width: 88px;
  height: 36px;
  left: 14px;
  top: 0;
`;

const Frame = styled.div`
  /* Frame 5569 */

  /* Auto Layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;

  position: absolute;
  width: 899px;
  height: 300px;
  left: 208px;
  top: 56px;
`;

const TitleContainer = styled.div`
  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 24px 0;
  width: 665px;
`;

const BodyContainer = styled.div`
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 16px 0;
  width: 665px;
`;

const Infobox = styled.div`
  /* 💎 Infobox */

  /* Auto Layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0;

  position: static;
  width: 665px;
  height: 100%;
  left: 0;
  top: 40px;

  /* midBlue/100 */
  background: #edf0ff;
  border-radius: 8px;

  /* Inside Auto Layout */
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 16px 0;
`;

const ListContainer = styled.div`
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 16px;
`;

const UnorderedList = styled.ul`
  padding: 0 0 0 20px;
  color: #4255bb;
`;

const GraphicContainer = styled.div`
  /* search */

  position: static;
  width: 180px;
  height: 180px;
  left: 719px;
  top: 60px;

  /* Inside Auto Layout */
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 0 54px;
`;
