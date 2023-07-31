# Tooltip

```js
import { Tooltip } from 'eureka-webcomponents/Tooltip';
```

<!-- Brief summary of what the component is, and what it's for. -->

A tooltip is displayed upon tapping and holding a component (on mobile) or hovering over it (desktop).

Continuously display the tooltip as long as the user long-presses or hovers over the element. Tooltips only include
short, descriptive text.

    - Tooltips describe differences between similar elements.
    - Tooltips distinguish actions with related iconography

<!-- STORY -->

#### Example

```js
import { Tooltip } from 'eureka-webcomponents/Tooltip';

render() {
  return (<>
            <Tooltip title="Add" placement="top">
                <div>top</div>
            </Tooltip>
        </>
    );
}
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
