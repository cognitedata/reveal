import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Container } from 'pages/elements';
import {
  selectSelectedCalculation,
  selectSelectedCalculationConfig,
} from 'store/file/selectors';
import { ConfigurationForm } from 'components/forms/ConfigurationForm/ConfigurationForm';
import { resetSelectedCalculationConfig } from 'store/file';
import { fetchCalculationFile } from 'store/file/thunks';
import { CdfClientContext } from 'providers/CdfClientProvider';

import TitleArea from './TitleArea';

export default function CalculationConfiguration() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const selectedCalculation = useAppSelector(selectSelectedCalculation);
  const selectedConfig = useAppSelector(selectSelectedCalculationConfig);
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
        externalId: { externalId: selectedCalculation?.externalId || '' },
      })
    );
  }, [selectedCalculation]);

  return (
    <Container>
      <TitleArea fileData={selectedCalculation} />
      {selectedConfig && <ConfigurationForm formData={selectedConfig} />}
    </Container>
  );
}
