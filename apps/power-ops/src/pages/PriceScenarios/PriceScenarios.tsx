import { PriceScenariosChart } from 'components/PriceScenariosChart';
import { PriceArea } from '@cognite/power-ops-api-types';
import { useEffect, useState } from 'react';

import { MainPanel, GraphContainer, StyledIcon, StyledTabs } from './elements';

const PriceScenario = ({ priceArea }: { priceArea: PriceArea }) => {
  const [externalIds, setExternalIds] = useState<
    { externalId: string }[] | undefined
  >();

  useEffect(() => {
    if (priceArea) {
      const externalIdsArray = priceArea?.priceScenarios.map((scenario) => {
        return { externalId: scenario.externalId };
      });
      setExternalIds(externalIdsArray);
    }
  }, [priceArea]);

  return (
    <MainPanel>
      <GraphContainer>
        <PriceScenariosChart priceArea={priceArea} externalIds={externalIds} />
        <StyledTabs>
          <StyledTabs.TabPane key="Total" tab="Total" />
          {priceArea?.priceScenarios.map((scenario) => {
            return (
              <StyledTabs.TabPane
                key={scenario.externalId}
                tab={
                  <>
                    <StyledIcon type="Stop" />
                    {scenario.name}
                  </>
                }
              />
            );
          })}
        </StyledTabs>
      </GraphContainer>
    </MainPanel>
  );
};

export default PriceScenario;
