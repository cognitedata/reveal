import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

const fakeHelperFunction = (): Promise<string> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Fake error'));
    }, 1000);
  });
};

const App = () => {
  const [crashing, setCrashing] = useState(false);
  const [buttonText, setButtonText] = useState(() => 'Crash me!');

  const clickHandler = () => {
    setCrashing(true);
    fakeHelperFunction().then(output => {
      // This will never be seen.
      setButtonText(output);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>This is v{process.env.REACT_APP_VERSION_NAME || '0.0.0'} :-)</p>
        <a
          className="App-link"
          href="https://cog.link/fas"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn about how this is hosted
        </a>
        <button disabled={crashing} type="button" onClick={clickHandler}>
          {buttonText}
        </button>
      </header>
    </div>
  );
};

export default App;
