import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'components/Extractors/.storybook/boilerplate';

import Extractors from './Extractors';

storiesOf('|Extractors', module)
    .addDecorator((story) => <Provider story={story} />)
    .add('Base', () => <Extractors />)
    .add('Stateful story', () => {
        class StatefulExtractors extends React.Component {
            state = {};

            render() {
                return (
                    <div>
                        <Extractors />
                    </div>
                );
            }
        }
        return <StatefulExtractors />;
    });