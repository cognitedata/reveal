// throws error on everything that is not mocked
export const onUnhandledRequest = (req: any) => {
  const bodyToFormattedString = (body: any) => {
    if (!body) {
      return '';
    }
    try {
      return `\n${JSON.stringify(body, null, 2)}`;
    } catch {
      // body is not json
      return '';
    }
  };

  // eslint-disable-next-line no-console
  console.error(
    `Not mocked API request: ${req.method} ${req.url}${bodyToFormattedString(
      req.body
    )}`
  );

  throw new Error(`Not mocked API request: ${req.method} ${req.url}`);
};
