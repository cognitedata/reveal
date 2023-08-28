const removeRecursive = <T extends { id?: string; children?: T[] | undefined }>(
  container: T,
  shouldRemoveContainer: (fn: T) => boolean
): T => ({
  ...container,
  ...(container.children !== undefined && Array.isArray(container.children)
    ? {
        children: container.children
          .filter((child) => !shouldRemoveContainer(child))
          .map((child) => removeRecursive(child, shouldRemoveContainer)),
      }
    : {}),
});

export default removeRecursive;
