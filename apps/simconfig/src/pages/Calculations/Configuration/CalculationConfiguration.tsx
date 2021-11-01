import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Container } from 'pages/elements';
import {
  selectSelectedCalculation,
  selectSelectedCalculationConfig,
} from 'store/file/selectors';
import { ConfigurationForm } from 'components/forms/ConfigurationForm/ConfigurationForm';
import { resetSelectedCalculationConfig } from 'store/file';

import TitleArea from './TitleArea';

export default function CalculationConfiguration() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const selectedCalculation = useAppSelector(selectSelectedCalculation);
  const selectedConfig = useAppSelector(selectSelectedCalculationConfig);

  const resetConfigFile = () => {
    dispatch(resetSelectedCalculationConfig());
  };
  useEffect(() => {
    resetConfigFile();
  }, [history.location]);

  return (
    <Container>
      <TitleArea fileData={selectedCalculation} />
      {selectedConfig && <ConfigurationForm formData={selectedConfig} />}
    </Container>
  );
}
