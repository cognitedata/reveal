# Dropdowns

```js
import { Select } from 'eureka-webcomponents';
```

<!-- Brief summary of what the component is, and what it's for. -->

Dropdown menus display a list of options, triggered by an icon, button, or action. A menu’s position on screen affects where and how it will appear. If opened at the top of the screen, it will expand downwards (to avoid being cropped). Dropdown menus are positioned relative to both the element that generates them and the edges of the screen or browser. They can appear in front of, beside, above, or below the element that generates them.

<!-- STORY -->

#### Example

```js
import { Select } from 'eureka-webcomponents';

const SelectStory = (props) => {
  const [selected, setSelected] = useState(null);
  const items = [
    { id: 1, title: 'test' },
    { id: 2, title: 'test 2' },
    { id: 3, title: 'test 3' },
    { id: 4, title: 'test 4' },
    { id: 5, title: 'test 5' },
    { id: 6, title: 'test 6' },
    { id: 7, title: 'test 7' },
    { id: 8, title: 'test 8' },
    { id: 9, title: 'test 9' },
    { id: 10, title: 'test 10' },
    { id: 11, title: 'test 11' },
    { id: 12, title: 'test 12' },
    { id: 13, title: 'test 13' },
    { id: 14, title: 'test 14' },
    { id: 15, title: 'test 15' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        renderDisplay={(item) => item.title}
        items={items}
        onClick={(item) => setSelected(item)}
        selectedItem={selected}
      >
        <Button aria-label="Open list">Open list</Button>
      </Select>

      <div>Selected item: {selected && selected.title}</div>
    </div>
  );
};
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
