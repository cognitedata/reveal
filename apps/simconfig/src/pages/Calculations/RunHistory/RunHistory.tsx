import { Container } from 'pages/elements';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSelectedCalculation } from 'store/file/selectors';
import RunHistoryTable from 'components/tables/RunHistoryTable/RunHistoryTable';
import { fetchEventHistoryByCalculationId } from 'store/event/thunks';
import { EVENT_CONSTANTS } from 'components/tables/CalculationsTable/constants';
import { selectEventHistory } from 'store/event/selectors';

import TitleArea from './TitleArea';

export default function RunHistory() {
  const selectedCalculation = useAppSelector(selectSelectedCalculation);
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

  return (
    <Container>
      <TitleArea fileData={selectedCalculation} />

      {eventHistory && <RunHistoryTable data={eventHistory} />}
    </Container>
  );
}
