import React from "react";
import styled from "styled-components/macro";
import { useLocation, useHistory } from "react-router-dom";
import { TopBar, Graphic, Title, Colors } from "@cognite/cogs.js";
import { NavigationLink } from "@cognite/cogs.js/dist/Components/TopBar/Modules/Navigation";

const tabs: Array<{
  slug: string;
  title: string;
}> = [
  {
    slug: "",
    title: "Solutions",
  },
  {
    slug: "guidetools",
    title: "Guide & Tools",
  },
  {
    slug: "status",
    title: "Status",
  },
];

export const Header = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const projectManagementLinks: NavigationLink[] = tabs.map((tab) => ({
    name: tab.title,
    isActive: pathname === `/${tab.slug}`,
    onClick: () => {
      history.push({
        pathname: `/${tab.slug}`,
      });
    },
  }));

  const renderLinks = () => {
    return <TopBar.Navigation links={projectManagementLinks} />;
  };

  return (
    <TopBar>
      <TopBar.Left>
        <StyledTopBarItemLogo
          onClick={() => {
            history.push("/");
          }}
        >
          <StyledGraphicLogo type="Cognite" />
          <StyledTitleLogo level={6}>Platypus</StyledTitleLogo>
        </StyledTopBarItemLogo>
        {renderLinks()}
      </TopBar.Left>
      <TopBar.Right />
    </TopBar>
  );
};

const StyledTopBarItemLogo = styled(TopBar.Item)`
  padding: 0 1.6rem;
  cursor: pointer;
  &:hover {
    background-color: ${Colors["midblue-8"].hex()};
  }
`;

const StyledGraphicLogo = styled(Graphic)`
  width: 3.5rem !important;
  margin: 0 1rem 0 0;
`;

const StyledTitleLogo = styled(Title)`
  font-weight: 700;
  font-size: 1.4rem;
`;
