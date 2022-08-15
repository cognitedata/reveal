import { Button } from '@cognite/cogs.js';

import { SubSearchFilterWrapper } from '../SubSearchFilterWrapper';

export const PeopleSearchSubFilters = () => {
  return (
    <SubSearchFilterWrapper filterName="people">
      <Button type="tertiary" size="small">
        Teams
      </Button>
    </SubSearchFilterWrapper>
  );
};
