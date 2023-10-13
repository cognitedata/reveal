import { CopilotAction } from '../../types';
import { SourceResponse } from '../../utils/types';

// Function for printing the sources used to find multiple answers
// Also used to generate CopilotActions for opening the documents
export function prepareSources(sourceList: SourceResponse[]) {
  if (sourceList.length === 0) {
    return { sourceString: '', openDocActionList: [] };
  }

  let sourceString = '';
  const openDocActionList: CopilotAction[] = [];
  for (let i = 0; i < sourceList.length; i++) {
    let page;
    try {
      page = parseInt(sourceList[i].page);
    } catch (e) {
      page = sourceList[i].page;
    }
    if (
      sourceString.includes(
        `$Source: ${sourceList[i].source} \n [Page: ${page}]`
      )
    ) {
      continue;
    }
    if (openDocActionList.length < 5) {
      openDocActionList.push({
        content: 'Open: ' + (openDocActionList.length + 1),
        fromCopilotEvent: [
          'PUSH_DOC_ID_AND_PAGE',
          {
            docId: sourceList[i].fileId,
            page: String(page) || '1',
          },
        ],
      } as CopilotAction);
    }

    sourceString += `${i + 1}. ${sourceList[i].source} [Page: ${page}] \n`;
  }

  return { sourceString: sourceString, openDocActionList: openDocActionList };
}
