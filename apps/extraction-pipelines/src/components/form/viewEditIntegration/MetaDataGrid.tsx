import React, { FunctionComponent } from 'react';
import { Title } from '@cognite/cogs.js';
import { GridWithTopMargin } from 'styles/grid/StyledGrid';
import { MetaField } from 'components/integration/MetaDataField';
import { useIntegration } from '../../../hooks/details/IntegrationContext';
import { FieldGrid } from '../FieldView';
import { DetailFieldNames, Integration } from '../../../model/Integration';
import { DetailsGrid } from './MainDetails';
import { NO_META_DATA } from '../../../utils/constants';

interface OwnProps {}

type Props = OwnProps;

export const MetaDataGrid: FunctionComponent<Props> = () => {
  const {
    state: { integration },
  } = useIntegration();

  const renderMeta = (int: Integration | null) => {
    if (!int) {
      return <></>;
    }
    if (int.metadata === undefined || int.metadata === null) {
      return <p>{NO_META_DATA}</p>;
    }
    return (
      <>
        {Object.entries(int.metadata).map(([k, v], index) => {
          return (
            <FieldGrid
              className="field-view detail-row row-style-even row-height-4"
              key={`meta-${k}-${v}`}
            >
              <MetaField
                fieldKey={k}
                fieldValue={v}
                testId={`meta-label-${index}`}
              />
            </FieldGrid>
          );
        })}
      </>
    );
  };

  return (
    <GridWithTopMargin>
      <Title level={4}>{DetailFieldNames.META_DATA}</Title>
      <DetailsGrid>{renderMeta(integration)}</DetailsGrid>
    </GridWithTopMargin>
  );
};
