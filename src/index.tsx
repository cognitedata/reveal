import ReactDOM from 'react-dom';
import Config from 'models/charts/config/classes/Config';
import { isDevelopment, isPR } from './models/charts/config/utils/environment';
import App from './App';

// eslint-disable-next-line no-console
console.log(`Cognite Charts running in ${Config.environment}`);

if (isDevelopment || isPR) {
  // eslint-disable-next-line no-console
  console.log('Config', Config);
}

ReactDOM.render(<App />, document.getElementById('root'));
