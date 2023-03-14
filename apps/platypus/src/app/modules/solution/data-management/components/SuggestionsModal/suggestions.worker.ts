import { DMSRecord, findSuggestions } from '@platypus-core/domain/suggestions';

// eslint-disable-next-line
declare const self: any;

self.onmessage = async (
  e: MessageEvent<{
    sourceRecords: DMSRecord[];
    targetRecords: DMSRecord[];
    fillColumn: string;
    sourceColumns: string[];
    targetColumns: string[];
  }>
) => {
  const suggestions = await findSuggestions(e.data);
  postMessage(suggestions);
};
