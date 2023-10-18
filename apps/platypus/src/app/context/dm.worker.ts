import { TypeDefsParserService } from '@platypus/platypus-common-utils';

// eslint-disable-next-line
declare const self: any;

self.onmessage = async (
  e: MessageEvent<{
    dml: string;
    views?: {
      externalId: string;
      version: string;
    }[];
  }>
) => {
  postMessage(
    new TypeDefsParserService().parseSchema(e.data.dml, e.data.views)
  );
};
