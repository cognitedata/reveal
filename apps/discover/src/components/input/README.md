
# Inputs

```js
import { Input } from 'eureka-webcomponents/inputs';
```


<!-- Brief summary of what the component is, and what it's for. -->
Text inputs allow users to enter text into a UI. They typically appear in forms and dialogs.

<!-- STORY -->

#### Example

```js
import { Input } from 'eureka-webcomponents/inputs';

render() {
     const [state, setState] = useState({open:false, variant:"default"});
        return (<>
                <Input label="Error with value" placeholder="placeholder" error={true} value="Text Value" /> 
                <Input label="With icon (right)" value="Text Value" iconPosition="end" Icon={<Add />} /> 
            </>
            );
}
```

<!-- STORY HIDE START -->



<!-- STORY HIDE END -->



