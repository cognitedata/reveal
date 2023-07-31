import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const MeasurementsWrapper = styled(FlexColumn)`
  height: 100%;
  gap: ${sizes.normal};
  > * .js-plotly-plot {
    > * .scatterlayer {
      > * .points {
        transform: translate(-14px, -10px);
        .point {
          d: path(
            'M11.0949 6.28971C12.0199 4.28715 12.4823 3.28587 13.1206 2.97339C13.6754 2.7018 14.3246 2.7018 14.8794 2.97339C15.5177 3.28587 15.9801 4.28715 16.9051 6.28971L18.8304 10.4582C19.5281 11.9688 19.877 12.7241 19.7731 13.3351C19.6824 13.869 19.379 14.3433 18.9324 14.6495C18.4212 15 17.5893 15 15.9253 15H12.0747C10.4107 15 9.57877 15 9.06757 14.6495C8.62095 14.3433 8.3176 13.869 8.22686 13.3351C8.123 12.7241 8.47186 11.9688 9.16957 10.4582L11.0949 6.28971Z'
          );
        }
      }
    }
  }
`;

export const MeasurementsTopBar = styled(FlexRow)`
  position: sticky;
  top: 0;
  z-index: ${layers.FILTER_BOX};

  & > * {
    margin-left: 4px;
  }
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
`;
