import React, { Component } from 'react';
import logo from './twitch-logo.png';
import './App.css';
import GameAnalytics from './Components/GameAnalytics';
import ChatAnalytics from './Components/ChatAnalytics';
import fetchTwitch from './fetch-twitch';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamDetails: {
        user: 'billy1kirby',
        game_id: '394568',
        viewers: '0',
      }
    }
  }

  componentDidMount() {
    const username = this.state.streamDetails.user;
    const url = `https://api.twitch.tv/helix/streams?user_login=${username}`
    fetchTwitch(url)
    .then((data) => {
      if (data['data'].length > 0) {
        const streamerData = data['data'][0];
        console.log(streamerData);
        if (streamerData['type'] === 'live') {
          console.log('streamer is currently live');
          this.setState({
            streamDetails: {
              game_id: streamerData['game_id'],
              viewers: streamerData['viewer_count'],
            }
          });
        }
      } else {
        console.log('streamer is currently offline');
      }
    })
    .catch((err) => {
      throw err;
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Twitch Analytics</h1>
        </header>
        <GameAnalytics gameId={this.state.streamDetails.game_id} viewers={this.state.streamDetails.viewers} />
        <ChatAnalytics channel={this.state.streamDetails.user} />
      </div>
    );
  }
}

export default App;
