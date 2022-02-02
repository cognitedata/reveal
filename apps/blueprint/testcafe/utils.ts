import { Selector } from 'testcafe';

export const find = (attr) => Selector(`[data-test-id="${attr}"]`);

export const log = (msg: string, indent: boolean = false): void => {
  if (indent) {
    // eslint-disable-next-line no-console
    console.log(`\t\t${msg}`);

    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\t${msg}`);
};
