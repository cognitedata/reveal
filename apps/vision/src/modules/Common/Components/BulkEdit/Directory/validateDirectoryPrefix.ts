import { UNIX_MAX_DIRECTORY_LENGTH } from 'src/constants/BulkEditConstants';

export const validateDirectoryPrefix = ({
  directory,
}: {
  directory?: string;
}): string | boolean => {
  if (directory) {
    if (directory.charAt(0) !== '/') {
      return `Directory ${directory} is not a valid unix directory`;
    }
    if (directory.length > UNIX_MAX_DIRECTORY_LENGTH) {
      return `Directory length must be up to ${UNIX_MAX_DIRECTORY_LENGTH} characters. It was ${directory.length}.`;
    }
  }
  return false;
};
