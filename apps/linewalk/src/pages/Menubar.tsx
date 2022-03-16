import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

export const PagePath = {
  LINE_REVIEWS: '/lineReviews',
  LINE_REVIEW: '/lineReview/:id',
  SCARLET: '/scarlet',
  DIAGRAM_PARSER: '/diagramParser',
};

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = React.useState<string>(PagePath.LINE_REVIEWS);

  const handleNavigate = (page: string) => () => {
    console.log(page);
    setActive(page);
    history.push(page);
  };

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`/${window.location.pathname.split('/')[2]}`);
  }, []);

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo title="Cognite LineWalk" />
      </TopBar.Left>
      <TopBar.Navigation
        links={[
          {
            name: 'Line reviews',
            isActive: active === PagePath.LINE_REVIEWS,
            onClick: handleNavigate(PagePath.LINE_REVIEWS),
          },
          {
            name: 'Document Schema Scanner',
            isActive: active === PagePath.SCARLET,
            onClick: handleNavigate(PagePath.SCARLET),
          },
          {
            name: 'Diagram Parser',
            isActive: active === PagePath.DIAGRAM_PARSER,
            onClick: handleNavigate(PagePath.DIAGRAM_PARSER),
          },
        ]}
      />
    </TopBar>
  );
};
