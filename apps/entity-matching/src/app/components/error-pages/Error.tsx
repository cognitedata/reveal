import styled from 'styled-components';
import { Colors, Icon, Title } from '@cognite/cogs.js';
import { Instructions, ErrorPageContent } from './styled-components';

type ErrorPageProps = {
  title: string;
  instructions: string;
};

const ErrorPage = ({ title, instructions }: ErrorPageProps) => {
  return (
    <ErrorPageContent>
      <Error>
        <Icon type="ErrorFilled" />
        <span>{title}</span>
      </Error>
      <Instructions>
        <div>{instructions}</div>
      </Instructions>
    </ErrorPageContent>
  );
};

const Error = styled(Title).attrs({ level: 5 })`
  color: ${Colors['text-icon--status-critical']};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

export default ErrorPage;
