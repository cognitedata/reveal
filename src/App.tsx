import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import logo from './logo.svg';
import './App.css';

const App = () => {
  const [crashing, setCrashing] = useState(false);

  const clickHandler = () => {
    setCrashing(true);
    if (!crashing) {
      throw new Error('Synthetic error');
    }
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
        <Button
          disabled={crashing}
          type="danger"
          onClick={clickHandler}
          style={{ marginTop: 8 }}
        >
          Crash me!
        </Button>
      </header>
    </div>
  );
};

export default App;
