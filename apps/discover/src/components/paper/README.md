# Paper / Elevation

```js
import { Paper } from 'eureka-webcomponents/paper';
```

<!-- Brief summary of what the component is, and what it's for. -->

Elevation is the relative distance between two surfaces.
Elevations do the following:

- Reflect spatial relationships, such as how a floating action button’s shadow indicates it is separate from a card collection
- Focus attention on the highest elevation, such as a dialog temporarily appearing in front of other surfaces
- Elevation can be depicted using shadows or other visual cues, such as surface fills or opacities.

<!-- STORY -->

#### Example

```js
import { Paper } from 'eureka-webcomponents/paper';

const Story = () => {
  return (
    <>
      <Paper elevation={2} style={{ height: 200 }}>
        <div>Lorem ipsum doloar at... </div>
      </Paper>
    </>
  );
};
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
