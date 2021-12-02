import { CollapsablePanel } from '@cognite/cogs.js';
import { Container, CollapsableContainer } from 'pages/elements';
import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSelectedCalculation } from 'store/file/selectors';
import RunHistoryTable from 'components/tables/RunHistoryTable/RunHistoryTable';
import { fetchEventHistoryByCalculationId } from 'store/event/thunks';
import { EVENT_CONSTANTS } from 'components/tables/CalculationsTable/constants';
import { selectSelectedEvent, selectEventHistory } from 'store/event/selectors';
import { resetSelectedEvent } from 'store/event';

import TitleArea from './TitleArea';
import { RunDetailsContainer } from './RunDetailsContainer';

export default function RunHistory() {
  const selectedCalculation = useAppSelector(selectSelectedCalculation);
  const selectedEvent = useAppSelector(selectSelectedEvent);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const eventHistory = useAppSelector(selectEventHistory);
  const { cdfClient } = useContext(CdfClientContext);
  const getFilter = () => {
    if (!selectedCalculation?.source || !selectedCalculation?.externalId) {
      return {};
    }

    return {
      source: selectedCalculation?.source,
      type: EVENT_CONSTANTS.SIM_CALC,
      metadata: {
        calcConfig: selectedCalculation?.externalId, // Calc. config externalId
      },
    };
  };

  async function loadData() {
    const filter = getFilter();
    if (!filter || !filter.source) {
      return;
    }

    dispatch(fetchEventHistoryByCalculationId({ client: cdfClient, filter }));
  }

  useEffect(() => {
    loadData();
  }, [selectedCalculation]);

  useEffect(() => {
    dispatch(resetSelectedEvent());
  }, [history.location]);

  return (
    <CollapsableContainer>
      <CollapsablePanel
        sidePanelRightWidth={400}
        sidePanelRight={<RunDetailsContainer currentEvent={selectedEvent} />}
        sidePanelRightVisible={selectedEvent !== undefined}
      >
        <Container>
          <TitleArea fileData={selectedCalculation} />
          {eventHistory && <RunHistoryTable data={eventHistory} />}
        </Container>
      </CollapsablePanel>
    </CollapsableContainer>
  );
}
