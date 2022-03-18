import config from 'config/config';
import ReactDOM from 'react-dom';
import { isDevelopment, isPR } from './utils/environment';
import App from './App';

// eslint-disable-next-line no-console
console.log(`Cognite Charts running in ${config.environment}`);

if (isDevelopment || isPR) {
  // eslint-disable-next-line no-console
  console.log('Config', config);
}

ReactDOM.render(<App />, document.getElementById('root'));
