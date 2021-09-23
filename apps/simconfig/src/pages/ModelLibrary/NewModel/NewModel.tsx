import { Body, Title } from '@cognite/cogs.js';
import { ModelForm } from 'components/forms/ModelForm';
import { Container, Header } from 'pages/elements';

export default function NewModel() {
  return (
    <Container>
      <Header>
        <Title>Configure new model</Title>
      </Header>
      <Body>
        <ModelForm />
      </Body>
    </Container>
  );
}
