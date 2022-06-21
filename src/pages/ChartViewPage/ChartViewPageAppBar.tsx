import { Flex, Title, TopBar } from '@cognite/cogs.js';
import AppBarLeft from 'components/AppBar/AppBarLeft';
import AppBarRight from 'components/AppBar/AppBarRight';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import dayjs from 'dayjs';
import { useNavigate } from 'hooks/navigation';
import chartAtom from 'models/chart/atom';
import { useRecoilState } from 'recoil';
import { ChartActions } from '../../components/TopBar/ChartActions';

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
            <Title level={4}>
              <TranslatedEditableText
                value={chart?.name || ''}
                onChange={(value) => {
                  setChart((oldChart) => ({
                    ...oldChart!,
                    name: value,
                  }));
                }}
              />
            </Title>
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
