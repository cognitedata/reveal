import { FC } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import styled from 'styled-components/macro';

import { Typography } from 'components/Typography';
import { SeismicHeader } from 'modules/seismicSearch/service';

const PreWrappedTypography = styled(Typography)`
  margin-bottom: 25px;
  white-space: pre-wrap;
  width: 100%;
`;

interface Props {
  header?: SeismicHeader;
}

export const DatasetHeader: FC<Props> = ({ header }) => {
  if (!header || !header.meta) {
    return null;
  }

  return (
    <Scrollbars height={340}>
      <PreWrappedTypography variant="tinytext">
        {header.meta.header}
      </PreWrappedTypography>
    </Scrollbars>
  );
};

export default DatasetHeader;
