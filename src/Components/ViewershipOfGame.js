import React, { Component } from 'react';
import fetchTwitch from '../fetch-twitch';

class ViewershipOfGame extends Component {
  componentDidMount() {
    const url = `https://api.twitch.tv/helix/streams?game=${this.props.gameId}`
    fetchTwitch(url)
    .then((data) => {
      console.log(data);
      console.log(this.props.viewers);
    })
    .catch((err) => {
      throw err;
    });
  }
  render() {
    return (
      <div className="Viewership">
        <div>This is where the viewership will be</div>
      </div>
    );
  }
}

export default ViewershipOfGame;
