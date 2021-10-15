# Dropdowns

```js
import { Dropdown } from 'eureka-webcomponents';
```

<!-- Brief summary of what the component is, and what it's for. -->

Dropdown menus display a list of options, triggered by an icon, button, or action. A menu’s position on screen affects where and how it will appear. If opened at the top of the screen, it will expand downwards (to avoid being cropped). Dropdown menus are positioned relative to both the element that generates them and the edges of the screen or browser. They can appear in front of, beside, above, or below the element that generates them.

<!-- STORY -->

#### Example

```js
import { Dropdown } from 'eureka-webcomponents';
import { Button } from 'eureka-webcomponents';

const DropdownStory = () => {
  const [state, setState] = useState(null);
  const items = [
    { id: 1, title: 'test' },
    { id: 2, title: 'test 2' },
    { id: 3, title: 'test 3' },
  ];

  return (
    <div>
      <Typography variant="h5">Default</Typography>
      <div>
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          style={{ marginRight: 16 }}
          selected={state}
          items={items}
          displayField="title"
          valueField="id"
        />
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          style={{ marginRight: 16 }}
          label="With Label"
          selected={state}
          items={items}
          displayField="title"
          valueField="id"
        />
      </div>
      <br /> <br />
      <Typography variant="h5">Custom component</Typography>
      <div>
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          selected={state}
          component={
            <Button variant="outline">
              {state ? state.title : 'Open list'}
            </Button>
          }
          style={{ marginRight: 16 }}
          items={items}
          displayField="title"
          valueField="id"
        />
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          selected={state}
          component={
            <Button variant="contained">
              {state ? state.title : 'Open list'}
            </Button>
          }
          style={{ marginRight: 16 }}
          items={items}
          displayField="title"
          valueField="id"
        />
      </div>
    </div>
  );
};
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
