import React from 'react';
import logo from './logo.svg';
import './App.css';

const App = () => {
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
      </header>
    </div>
  );
};

export default App;
