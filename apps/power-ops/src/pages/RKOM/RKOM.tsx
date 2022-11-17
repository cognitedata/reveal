import { RkomFilterType } from '@cognite/power-ops-api-types';
import RKOMHeaderContainer from 'components/RKOMHeader/RKOMHeaderContainer';
import RKOMSidebarContainer from 'components/RKOMSidebar/RKOMSidebarContainer';
import { RKOMTableContainer } from 'components/RKOMTable/RKOMTableContainer';
import { useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { BaseContainer } from 'styles/layout';
import { PAGES } from 'types';

import { Container, MainDiv } from './elements';

export const RKOM = () => {
  const { path } = useRouteMatch();
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [filter, setFilter] = useState<RkomFilterType>();

  return (
    <BaseContainer data-testid="balancing-markets-page">
      <RKOMHeaderContainer
        filter={filter}
        onDownloadButtonClick={() => null}
        onFiltersChange={setFilter}
        disabledDownload
      />
      <Container>
        <RKOMSidebarContainer
          open={sidePanelOpen}
          onOpenClose={setSidePanelOpen}
        />
        <MainDiv sidePanelOpen={sidePanelOpen}>
          <Switch>
            <Route path={PAGES.RKOM_BID}>
              <RKOMTableContainer filter={filter} onSelectBid={() => null} />
            </Route>
            {/* <Route path={PAGES.RKOM_PERFORMANCE}>
              <div>RKOM Performance</div>
            </Route> */}
            <Redirect from={path} to={PAGES.RKOM_BID} />
          </Switch>
        </MainDiv>
      </Container>
    </BaseContainer>
  );
};
