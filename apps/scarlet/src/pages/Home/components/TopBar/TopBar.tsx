import { Icon, Skeleton } from '@cognite/cogs.js';
import { useHomePageContext } from 'hooks';

import * as Styled from './style';

export const TopBar = () => {
  const { homePageState } = useHomePageContext();
  const { facility, unitId } = homePageState;
  const { loading } = homePageState.unitListQuery;

  return (
    <Styled.Container>
      <Styled.Content>
        <Styled.Plant className="cogs-micro">
          <Icon type="OilPlatform" /> {facility?.shortName} plant
        </Styled.Plant>
        <Styled.Unit className="cogs-title-3">
          {!loading && unitId}
          {loading && (
            <Skeleton.Rectangle
              width="120px"
              height="24px"
              style={{ margin: '4px 0', display: 'block' }}
            />
          )}
        </Styled.Unit>
      </Styled.Content>
    </Styled.Container>
  );
};
