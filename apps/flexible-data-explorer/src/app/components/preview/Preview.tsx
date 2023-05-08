import { HoverablePreview } from '@cognite/cogs.js';

export const Preview = () => {
  return (
    <HoverablePreview fadeIn displayOn="hover">
      <HoverablePreview.Header underline>
        <HoverablePreview.Title>Aamir Khan</HoverablePreview.Title>
      </HoverablePreview.Header>

      <HoverablePreview.Cell title="Age" borders={['bottom', 'top']}>
        54
      </HoverablePreview.Cell>
    </HoverablePreview>
  );
};
