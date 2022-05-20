import { useNdsAggregatesByWellboreIdsQuery } from 'domain/wells/service/nds/queries/useNdsAggregatesByWellboreIdsQuery';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { SegmentedControl, Table } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { Modal } from 'components/Modal';
import { Treemap, TreeMapData } from 'components/Treemap/Treemap';
import { useDeepEffect } from 'hooks/useDeep';
import {
  useWellInspectSelectedWellbores,
  useWellInspectSelectedWellboreIds,
} from 'modules/wellInspect/hooks/useWellInspect';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';

import { DetailedView } from './detailedView';
import { NdsControlWrapper, WellboreTableWrapper } from './elements';
import { NdsTable } from './table';
import { NdsView, FilterData } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsFilterDataFromAggregate } from './utils/generateNdsFilterDataFromAggregate';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';

type SelectedView = 'treemap' | 'table';

const NdsEvents: React.FC = () => {
  // data
  const selectedWellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data: ndsEventsQuery } = useNdsEventsQuery();
  const { data, isLoading } = useNdsData();
  const { data: ndsAggregates } =
    useNdsAggregatesByWellboreIdsQuery(wellboreIds);

  // state
  const [selectedView, setSelectedView] = useState<SelectedView>('treemap');
  const [treemapData, setTreemapData] = useState<TreeMapData | undefined>(
    undefined
  );
  const [otherWellbores, setOtherWellbores] = useState<
    { name: string; id: string; numberOfEvents: number }[]
  >([]);
  const [riskTypeFilters, setRiskTypeFilters] = useState<FilterData[]>([]);
  console.log(riskTypeFilters);
  useDeepEffect(() => {
    setTreemapData(
      generateNdsTreemapData(selectedWellbores, ndsEventsQuery || {})
    );
  }, [selectedWellbores, ndsEventsQuery]);

  useDeepEffect(() => {
    if (ndsAggregates) {
      setRiskTypeFilters(generateNdsFilterDataFromAggregate(ndsAggregates));
    }
  }, [ndsAggregates]);

  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>();

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <NdsControlWrapper>
        <SegmentedControl
          currentKey={selectedView}
          onButtonClicked={(view) => setSelectedView(view as SelectedView)}
        >
          <SegmentedControl.Button key="treemap">
            Treemap
          </SegmentedControl.Button>
          <SegmentedControl.Button key="table">Table</SegmentedControl.Button>
        </SegmentedControl>
      </NdsControlWrapper>

      {selectedView === 'treemap' && treemapData && (
        <>
          <Treemap
            data={treemapData}
            onTileClicked={(d) => {
              if (d.id === 'other') {
                setOtherWellbores(d.wellbores as any);
              }
            }}
          />

          {/* The modal needs to be implemented properly, there is no design right now for this view so it's improvised */}
          <Modal
            visible={!!otherWellbores.length}
            title="List of wellbores"
            width={1000}
            onOk={() => setOtherWellbores([])}
            onCancel={() => setOtherWellbores([])}
          >
            <WellboreTableWrapper>
              <Table<{ name: string; id: string; numberOfEvents: number }>
                dataSource={otherWellbores}
                columns={[
                  {
                    Header: 'Wellbore name',
                    accessor: 'name',
                  },
                  {
                    Header: 'Number of NDS events',
                    accessor: 'numberOfEvents',
                    width: 100,
                  },
                ]}
                pagination={false}
                flexLayout={{
                  minWidth: 100,
                  width: 500,
                  maxWidth: 500,
                }}
              />
            </WellboreTableWrapper>
          </Modal>
        </>
      )}

      {selectedView === 'table' && (
        <NdsTable data={data} onClickView={setDetailedViewNdsData} />
      )}

      <DetailedView
        data={data}
        detailedViewNdsData={detailedViewNdsData}
        setDetailedViewNdsData={setDetailedViewNdsData}
      />
    </>
  );
};

export default NdsEvents;
