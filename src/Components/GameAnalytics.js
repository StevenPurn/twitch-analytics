import React, { Component } from 'react';
import fetchTwitch from '../fetch-twitch';

class GameAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewers: 0,
      totalGameViewers: 0,
    }
    this.updateGameData = this.updateGameData.bind(this);
  }

  updateGameData(gameId) {
    const originalUrl = `https://api.twitch.tv/helix/streams?game_id=${gameId}&language=en`;
    const gameStreams = [];
    const getGameData = (url) => {
      fetchTwitch(url)
      .then((data) => {
        data.data.forEach((stream) => gameStreams.push(stream));
        if (data.data.length === 20) {
          getGameData(originalUrl + `&after=${data.pagination.cursor}`);
        } else {
          let totalViews = 0;
          gameStreams.forEach((stream) => {
            totalViews += stream.viewer_count;
          });
          this.setState({
            totalGameViewers: totalViews,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
    }
    getGameData(originalUrl);
  }

  componentDidMount() {
    this.updateGameData(this.props.gameId);
  }

  render() {
    return (
      <div className="Viewership">
        <div>This is where the viewership will be</div>
      </div>
    );
  }
}

export default GameAnalytics;
