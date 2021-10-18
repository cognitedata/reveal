type RawExplorerQueryAction = 'list';
type RawExplorerQueryResource = 'databases';

const APPLICATION_KEY = 'fusion';
const PACKAGE_KEY = 'raw-explorer';

export const getRawExplorerBaseKey = (): string[] => [
  APPLICATION_KEY,
  PACKAGE_KEY,
];

export const getRawExplorerActionKey = (
  action: RawExplorerQueryAction
): string[] => [...getRawExplorerBaseKey(), action];

export const getRawExplorerQueryKey = (
  action: RawExplorerQueryAction,
  resource: RawExplorerQueryResource
): string[] => [...getRawExplorerActionKey(action), resource];
