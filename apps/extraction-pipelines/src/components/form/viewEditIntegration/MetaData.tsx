import React, { FunctionComponent } from 'react';
import { Title } from '@cognite/cogs.js';
import { GridWithTopMargin } from './ContactsDetails';
import { useIntegration } from '../../../hooks/details/IntegrationContext';
import { uppercaseFirstWord } from '../../../utils/primitivesUtils';
import { FieldGrid } from '../FieldView';
import { DetailFieldNames, Integration } from '../../../model/Integration';
import { DetailsGrid } from './MainDetails';

interface OwnProps {}

type Props = OwnProps;

const MetaData: FunctionComponent<Props> = () => {
  const {
    state: { integration },
  } = useIntegration();
  const renderMeta = (int: Integration | null) => {
    if (!int) {
      return null;
    }
    if (int.metadata) {
      return Object.entries(int.metadata).map(([k, v], index) => {
        return (
          <FieldGrid className="field-view detail-row" key={`meta-${k}-${v}`}>
            <label htmlFor={k} data-testid={`meta-label-${index}`}>
              {uppercaseFirstWord(k)}
            </label>
            <span id={k}>{v}</span>
          </FieldGrid>
        );
      });
    }
    return <p>No metadata registered</p>;
  };

  return (
    <GridWithTopMargin>
      <Title level={4}>{DetailFieldNames.META_DATA}</Title>
      <DetailsGrid>{integration && renderMeta(integration)}</DetailsGrid>
    </GridWithTopMargin>
  );
};

export default MetaData;
