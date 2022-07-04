import { Flex, TopBar } from '@cognite/cogs.js';
import AppBarLeft from 'components/AppBar/AppBarLeft';
import { useNavigate } from 'hooks/navigation';
import chartAtom from 'models/charts/charts/atoms/atom';
import { useRecoilState } from 'recoil';

type Props = {
  closeButtonText: string;
};

const FileViewPageAppBar = ({ closeButtonText = 'Back to chart' }: Props) => {
  const move = useNavigate();
  const [chart] = useRecoilState(chartAtom);
  return (
    <AppBarLeft>
      <Flex style={{ height: '100%' }}>
        <TopBar.Action
          text={`← ${closeButtonText}`}
          onClick={() => move(`/${chart?.id}`)}
          className="downloadChartHide"
        />
      </Flex>
    </AppBarLeft>
  );
};

export default FileViewPageAppBar;
