import { scaleLegendConfig, BlockScaleTrack } from '@cognite/videx-wellog';

import { LogData } from '../interfaces';

const FRMTrack = (trackId: number, logFrmTopsData: LogData) => {
  if (!logFrmTopsData.Frm) return null;
  const frmTrack = new BlockScaleTrack(trackId, {
    maxWidth: 50,
    width: 2,
    label: 'Frm',
    abbr: 'Frm',
    units: logFrmTopsData.Frm.unit,
    data: logFrmTopsData.Frm.values,
    legendConfig: scaleLegendConfig,
  });
  return frmTrack;
};

export default FRMTrack;
