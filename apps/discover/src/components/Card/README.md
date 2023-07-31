# Cards

```js
import { Card } from 'eureka-webcomponents/card';
```

<!-- Brief summary of what the component is, and what it's for. -->

Cards are surfaces that display content and actions on a single topic. They should be easy to scan for relevant and actionable information. Elements, like text and images, should be placed on them in a way that clearly indicates hierarchy.

The card container is the only required element in a card. All other elements are optional. Card layouts can vary to support the types of content they contain.

<!-- STORY -->

#### Example

```js
import {Card} from 'eureka-webcomponents/card';

render() {
     const action = (<OutlinedButton text="Action" />);

        return (<>
                <Card title="This is a base card" subheader="September 14, 2018" text="Lorem ipsum dolor at" avatarText="AA" />

                <Card title="Card with custom content" subheader="September 14, 2018" text="Lorem ipsum dolor at" avatarText="AA" action={action} >
                    <div style={{display:"flex", flexDirection:"row"}}>
                        <div>
                            <Typography>
                                Members!
                            </Typography>
                        </div>
                        <div style={{flexGrow:1}} />
                        <div>
                            <Typography>
                                Assets
                            </Typography>
                        </div>
                    </div>
                    <div style={{display:"flex", justifyContent:"center"}}>
                        <img src={logo} style={{width:75, height:75}} />
                    </div>
                </Card>
            </>
            );
}
```

<!-- STORY HIDE START -->

<!-- STORY HIDE END -->
