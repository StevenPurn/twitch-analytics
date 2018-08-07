import React, { Component } from 'react';
import logo from './twitch-logo.png';
import './App.css';
import ViewershipOfGame from './Components/ViewershipOfGame';
import fetchTwitch from './fetch-twitch';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamDetails: {
        user: 'sypherpk',
        game_id: '33214',
        viewers: '0',
      }
    }
  }

  componentDidMount() {
    const url = `https://api.twitch.tv/helix/streams?user_login=${this.state.streamDetails['user']}`
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
        <ViewershipOfGame gameId={this.state.streamDetails.game_id} viewers={this.state.streamDetails.viewers} />
      </div>
    );
  }
}

export default App;
