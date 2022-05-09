const shortcuts: {
  id: string;
  description?: string;
  binding?: string | string[];
}[] = [
  {
    id: 'select_tool',
    description: 'Switch to the Select Tool',
    binding: 'v',
  },
  {
    id: 'create_point',
    description: 'Create a point',
    binding: 'k',
  },
  {
    id: 'create_bounding_box',
    description: 'Create a bounding box',
    binding: 'r',
  },
  {
    id: 'pan_tool',
    description: 'Select the Pan Tool',
    binding: 'h',
  },
  {
    id: 'create_polygon',
    description: 'Create a Polygon',
    binding: 'p',
  },
  {
    id: 'create_line',
    description: 'Create a Line',
    binding: 'l',
  },
  {
    id: 'move_up_annotation_list',
    description: 'Move up in annotation list',
    binding: 'ArrowUp',
  },
  {
    id: 'move_down_annotation_list',
    description: 'Move down in annotation list',
    binding: 'ArrowDown',
  },
  {
    id: 'move_into_annotation_collection',
    description: 'Move into annotation collection',
    binding: ['Control+ArrowDown', 'Meta+ArrowDown'],
  },
  {
    id: 'move_out_annotation_collection',
    description: 'Move out of annotation collection',
    binding: ['Control+ArrowUp', 'Meta+ArrowUp'],
  },
  {
    id: 'delete_annotation',
    description: 'Set selected annotation as true',
    binding: 'BACKSPACE',
  },
];

export const hotKeyMap: { [key: string]: string | string[] } = {};
shortcuts.forEach((shortcut) => {
  if (shortcut.binding) {
    hotKeyMap[shortcut.id] = shortcut.binding;
  }
});
