import { PriceScenariosChart } from 'components/PriceScenariosChart';
import { PriceArea } from '@cognite/power-ops-api-types';
import { SetStateAction, useEffect, useState } from 'react';
import { pickChartColor } from 'utils/utils';

import { MainPanel, GraphContainer, StyledIcon, StyledTabs } from './elements';

const PriceScenario = ({ priceArea }: { priceArea: PriceArea }) => {
  const [externalIds, setExternalIds] = useState<
    { externalId: string }[] | undefined
  >();

  const [activeTab, setActiveTab] = useState<string>('total');
  const changeTab = (tab: SetStateAction<string>) => {
    setActiveTab(tab);
  };

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
        <PriceScenariosChart
          priceArea={priceArea}
          externalIds={externalIds}
          activeTab={activeTab}
          changeTab={changeTab}
        />
        <StyledTabs
          defaultActiveKey="total"
          activeKey={activeTab}
          onChange={changeTab}
        >
          <StyledTabs.TabPane key="total" tab="Total" />
          {priceArea?.priceScenarios.map((scenario, index) => {
            return (
              <StyledTabs.TabPane
                key={scenario.externalId}
                tab={
                  <>
                    <StyledIcon type="Stop" color={pickChartColor(index)} />
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
