import { useNavigate } from 'react-router-dom';

import AppBarLeft from '@charts-app/components/AppBar/AppBarLeft';
import AppBarRight from '@charts-app/components/AppBar/AppBarRight';
import TranslatedEditableText from '@charts-app/components/EditableText/TranslatedEditableText';
import chartAtom from '@charts-app/models/chart/atom';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';

import { Flex, TopBar } from '@cognite/cogs.js';

import { ChartActions } from '../../components/TopBar/ChartActions';

import { ChartName } from './elements';

type Props = {
  allChartsLabel: string;
};

const ChartViewPageAppBar = ({ allChartsLabel = 'All charts' }: Props) => {
  const move = useNavigate();
  const [chart, setChart] = useRecoilState(chartAtom);
  const username =
    chart?.userInfo?.displayName || chart?.userInfo?.email || chart?.user;
  return (
    <>
      <AppBarLeft>
        <Flex style={{ height: '100%' }}>
          <TopBar.Action
            text={`← ${allChartsLabel}`}
            onClick={() => move('')}
            className="downloadChartHide"
          />
          <div className="cogs-topbar--item" style={{ paddingLeft: 16 }}>
            <ChartName level={4}>
              <TranslatedEditableText
                value={chart?.name || ''}
                onChange={(value) => {
                  setChart((oldChart) => ({
                    ...oldChart!,
                    name: value,
                  }));
                }}
              />
            </ChartName>
          </div>
        </Flex>
      </AppBarLeft>
      <AppBarRight>
        <div
          className="cogs-topbar--item"
          style={{
            borderLeft: 'none',
            color: 'var(--cogs-greyscale-grey6)',
            whiteSpace: 'nowrap',
            marginRight: 17,
          }}
        >
          {dayjs(chart?.updatedAt).format('LL')} · {username}
        </div>
        <ChartActions />
      </AppBarRight>
    </>
  );
};

export default ChartViewPageAppBar;
