import { FunctionComponent, PropsWithChildren } from 'react';

import styled from 'styled-components';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { Button, Colors, Icon, Link, Table } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { DataSetWithExtpipes } from '../../../actions';
import { useTranslation } from '../../../common/i18n';
import { getExtractionPipelineUIUrl } from '../../../utils/extpipeUtils';
import {
  LineageSection,
  LineageSubTitle,
  LineageTitle,
  NoDataText,
} from '../../../utils/styledComponents';
import { Extpipe } from '../../../utils/types';
import InfoTooltip from '../../InfoTooltip';

import { ExtpipeSourceExtractorProps } from './ExtpipeSourceExtractor';
import { useExtpipeTableColumns } from './ExtpipeTableColumns';

interface ExtpipeTableProps extends ExtpipeSourceExtractorProps {
  dataSetWithExtpipes: DataSetWithExtpipes;
  isExtpipesFetched?: boolean;
}

const StyledButton = styled(Link)`
  margin-top: 8px;

  &:focus {
    color: ${Colors['surface--muted']};
  }
`;

const ExtpipeTable: FunctionComponent<ExtpipeTableProps> = ({
  dataSetWithExtpipes,
  isExtpipesFetched,
}: PropsWithChildren<ExtpipeTableProps>) => {
  const { t } = useTranslation();
  const { extpipeTableColumns } = useExtpipeTableColumns();
  const { extpipes, dataSet } = dataSetWithExtpipes;

  const { flow } = getFlow();
  const permissionsExtractionPipelines = usePermissions(
    flow,
    'extractionPipelinesAcl',
    'WRITE'
  );
  const canEditExtractionPipelines = permissionsExtractionPipelines.data;

  const addExtpipeLink = () => {
    const dataSetId = dataSet.id;
    return `${createLink(getExtractionPipelineUIUrl('/create'), {
      dataSetId,
    })}`;
  };

  const createExtpipeButton = canEditExtractionPipelines ? (
    <StyledButton href={addExtpipeLink()}>
      <Icon type="Plus" /> {t('extpipe-create-extpipe')}
    </StyledButton>
  ) : (
    <InfoTooltip showIcon={false} tooltipText={t('extpipe-permissions-write')}>
      <Button disabled icon="Plus">
        {t('extpipe-create-extpipe')}
      </Button>
    </InfoTooltip>
  );

  return (
    <LineageSection>
      <LineageTitle>
        {t('extpipe-extpipes-title', { postProcess: 'uppercase' })}
      </LineageTitle>
      <LineageSubTitle>
        <span>{t('extpipe-extpipes-subtitle')}</span>
        <span css="flex-shrink: 0">{createExtpipeButton}</span>
      </LineageSubTitle>
      {!extpipes ? (
        <NoDataText>{t('extpipe-permissions-read')}</NoDataText>
      ) : (
        <>
          {isExtpipesFetched ? (
            <Table
              columns={extpipeTableColumns as any}
              dataSource={extpipes}
              pageSize={5}
              rowKey={(record: Extpipe) => `${record?.id}`}
            />
          ) : (
            <Icon type="Loader" />
          )}
        </>
      )}
    </LineageSection>
  );
};

export default ExtpipeTable;
