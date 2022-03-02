export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const getRuntimeLabel = (runtime: string) => {
  runtime = runtime.replace('py', 'Python ');
  runtime = runtime.replace('3', '3.');
  runtime = runtime.replace('js', 'Javascript');

  return runtime;
};
