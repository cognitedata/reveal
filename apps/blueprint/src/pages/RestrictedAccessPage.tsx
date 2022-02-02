export type RestrictedAccessPageProps = {
  message?: string | object;
};

const RestrictedAccessPage = ({ message }: RestrictedAccessPageProps) => {
  const renderMessage = () => {
    if (typeof message === 'string') {
      return message;
    }

    // eslint-disable-next-line no-console
    console.error({ ...message });
    return 'Failed';
  };
  return <div>{renderMessage()}</div>;
};

export default RestrictedAccessPage;
