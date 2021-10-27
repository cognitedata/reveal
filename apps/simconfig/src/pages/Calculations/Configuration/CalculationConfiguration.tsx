import { useAppSelector } from 'store/hooks';
import { selectSelectedCalculation } from 'store/file/selectors';
import { Container } from 'pages/elements';

import TitleArea from './TitleArea';

export default function CalculationConfiguration() {
  const selectedCalculation = useAppSelector(selectSelectedCalculation);

  return (
    <Container>
      <TitleArea fileData={selectedCalculation} />
    </Container>
  );
}
