import React from 'react';
import { Switch, Route } from 'react-router';
import logo from './twitch-logo.png';
import AnalyticsPage from './Components/Analytics/AnalyticsPage';
import Home from './Components/Home';
import './App.css';

const App = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">Twitch Analytics</h1>
    </header>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/:username' component={AnalyticsPage}/>
    </Switch>
  </div>
);

export default App;
