import { useEffect, useContext } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Container } from 'pages/elements';
import {
  selectSelectedCalculation,
  selectSelectedCalculationConfig,
  selectSelectedCalculationConfigStatus,
} from 'store/file/selectors';
import { ConfigurationForm } from 'components/forms/ConfigurationForm/ConfigurationForm';
import { resetSelectedCalculationConfig } from 'store/file';
import { fetchCalculationFile } from 'store/file/thunks';
import { RequestStatus } from 'store/types';
import { CdfClientContext } from 'providers/CdfClientProvider';

import TitleArea from './TitleArea';

interface Params {
  externalId: string;
}
export default function CalculationConfiguration() {
  const { params } = useRouteMatch<Params>();
  const { externalId } = params;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const selectedCalculation = useAppSelector(selectSelectedCalculation);
  const selectedConfig = useAppSelector(selectSelectedCalculationConfig);
  const selectedConfigStatus = useAppSelector(
    selectSelectedCalculationConfigStatus
  );
  const errorStatus = selectedConfigStatus === RequestStatus.ERROR;
  const { cdfClient } = useContext(CdfClientContext);

  const resetConfigFile = () => {
    dispatch(resetSelectedCalculationConfig());
  };
  useEffect(() => {
    resetConfigFile();
  }, [history.location]);

  useEffect(() => {
    dispatch(
      fetchCalculationFile({
        client: cdfClient,
        externalId: { externalId: externalId || '' },
      })
    );
  }, [selectedCalculation, externalId, errorStatus]);

  return (
    <Container>
      <TitleArea fileData={selectedConfig} />
      <ConfigurationForm formData={selectedConfig} externalId={externalId} />
    </Container>
  );
}
