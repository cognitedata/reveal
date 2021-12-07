import { Button, Flex } from '@cognite/cogs.js';

type Props = {
  title: string;
  text?: string;
};

const ErrorToast = ({ title, text }: Props) => (
  <div>
    <h3>{title}</h3>
    <div style={{ paddingBottom: 8 }}>{text}</div>
    <Flex>
      <Button
        type="primary"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Reload Page
      </Button>
    </Flex>
  </div>
);

export default ErrorToast;
