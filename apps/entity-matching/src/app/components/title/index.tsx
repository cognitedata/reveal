import { Heading } from '@cognite/cogs.js';

const Title = ({
  title,
  dataTestId,
}: {
  title: string;
  dataTestId?: string;
}) => {
  return (
    <Heading level={3} data-testid={dataTestId}>
      {title}
    </Heading>
  );
};

export default Title;
