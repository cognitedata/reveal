import { useTranslation } from 'react-i18next';

import { WhiteLoader } from 'components/loading';
import {
  useSelectedWellBoresFIT,
  useSelectedWellBoresPPFG,
  useSelectedWellBoresLOT,
} from 'modules/wellSearch/selectors';

import { EMPTY_PPFGS_MESSAGE } from '../../constants';
import { MessageWrapper } from '../common/elements';

import { MultiplePPFGViewer } from './MultiplePPFGViewer';

export const MultiplePPFGPreview = () => {
  const { t } = useTranslation('WellData');

  const { isLoading: ppfgsLoading, ppfgs } = useSelectedWellBoresPPFG();
  const { isLoading: fitsLoading, fits } = useSelectedWellBoresFIT();
  const { isLoading: lotsLoading, lots } = useSelectedWellBoresLOT();

  if (ppfgsLoading || fitsLoading || lotsLoading) {
    return <WhiteLoader />;
  }

  if (ppfgs.length === 0) {
    return <MessageWrapper>{t(EMPTY_PPFGS_MESSAGE)}</MessageWrapper>;
  }
  const sequences = [
    ...ppfgs.map((row) => ({ ...row, sequenceType: 'PPFG' })),
    ...fits.map((row) => ({ ...row, sequenceType: 'FIT' })),
    ...lots.map((row) => ({ ...row, sequenceType: 'LOT' })),
  ];

  return <MultiplePPFGViewer sequences={sequences} />;
};

export default MultiplePPFGPreview;
