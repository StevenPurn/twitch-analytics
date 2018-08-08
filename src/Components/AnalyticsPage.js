import React, { Component } from 'react';
import GameAnalytics from './GameAnalytics';
import ChatAnalytics from './ChatAnalytics';
import fetchTwitch from '../fetch-twitch';

const tmi = require('tmi.js');

class AnalyticsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamDetails: {
        user: '',
        game_id: '',
        viewers: 0,
        totalGameViewers: 0,
      },
      chat: {
        messagesByUser: {},
        topTenActiveUsers: [],
        avgMessagesPerChatter: 0,
        emoteUseCount: {},
        topTenEmotes: [],
        ignoreMessagesFrom: [],
      }
    }
    this.updateStreamDetails = this.updateStreamDetails.bind(this);
    this.onMessageHandler = this.onMessageHandler.bind(this);
    this.onConnectedHandler = this.onConnectedHandler.bind(this);
    this.onDisconnectedHandler = this.onDisconnectedHandler.bind(this);
    this.calculateMessageStats = this.calculateMessageStats.bind(this);
    this.calculateEmoteStats = this.calculateEmoteStats.bind(this);
    this.connectToChat = this.connectToChat.bind(this);
  }

  setUsernameToIgnore(username) {
    const usersToIgnore = this.state.ignoreMessagesFrom.slice();
    if (usersToIgnore.includes(username) === false) {
      usersToIgnore.push(username);
      const chat = Object.assign({}, this.state.chat, { ignoreMessagesFrom: usersToIgnore });
      this.setState({
        chat
      });
    }
  }

  onMessageHandler(target, context, msg, self) {
    const username = context['display-name'];
    const { ignoreMessagesFrom } = this.state.chat;
    if (ignoreMessagesFrom.includes(username)){
      return;
    }
    const emotes = context['emotes'];
    if (emotes !== null) {
      const { emoteUseCount } = this.state.chat;
      this.calculateEmoteStats(emotes, emoteUseCount);
    }

    const { messagesByUser } = this.state.chat;
    this.calculateMessageStats(messagesByUser, username);
  }

  calculateEmoteStats(emotes, emoteUseCount) {
    const emoteKeys = Object.keys(emotes);
    for (let i = 0; i < emoteKeys.length; i += 1) {
      const count = emoteKeys[i].length;
      if (emoteUseCount[emoteKeys[i]]) {
        emoteUseCount[emoteKeys[i]] += count;
      } else {
        emoteUseCount[emoteKeys[i]] = count;
      }
    }
    const newTopTenEmotes = [];
    const keys = Object.keys(emoteUseCount);
    for (let i = 0; i < keys.length; i += 1) {
      const useCount = emoteUseCount[keys[i]];
      newTopTenEmotes.push({ name: keys[i], count: useCount });
    }

    newTopTenEmotes.sort((a, b) => b.count - a.count);
    const newChat = {
      topTenEmotes: newTopTenEmotes.slice(0, 10),
      emoteUseCount
    };
    const chat = Object.assign({}, this.state.chat, newChat);
    this.setState({
      chat
    });
  }

  calculateMessageStats(messagesByUser, username) {
    if (messagesByUser[username]) {
      messagesByUser[username] += 1;
    } else {
      messagesByUser[username] = 1;
    }
    const newTopTenActiveUsers = [];
    let totalMessages = 0;
    const keys = Object.keys(messagesByUser);
    for (let i = 0; i < keys.length; i += 1) {
      const messages = messagesByUser[keys[i]];
      totalMessages += messages;
      newTopTenActiveUsers.push({name: keys[i], count: messages });
    }

    newTopTenActiveUsers.sort((a, b) => b.count - a.count);
    const newChat = {
      topTenActiveUsers: newTopTenActiveUsers.slice(0, 10),
      avgMessagesPerChatter: totalMessages/keys.length,
    };
    const chat = Object.assign({}, this.state.chat, newChat);
    this.setState({
      chat
    });
  }

  onConnectedHandler(addr, port) {
    console.log(`Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler(reason) {
    console.log(`Disconnected: ${reason}`);
  }

  connectToChat(channel) {
    let opts = {
      identity: {
        username: 'analyticsrobot',
        password: 'oauth:995yubntaffgwmbfd3cj3yq1hovuvc'
      },
        channels: [
          channel
        ]
      };
      let client = new tmi.client(opts);
      
      client.on('message', this.onMessageHandler);
      client.on('connected', this.onConnectedHandler);
      client.on('disconnected', this.onDisconnectedHandler);
      
      client.connect();
  }

  updateGameDetails(game_id) {

  }

  updateStreamDetails(username) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${username}`
    fetchTwitch(url)
    .then((data) => {
      if (data['data'].length > 0) {
        const streamerData = data['data'][0];
        let streamDetails;
        if (streamerData['type'] === 'live') {
          const newDetails = {
            user: username,
            game_id: streamerData.game_id,
            viewers: streamerData.viewer_count,
          };
          streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
          this.updateGameDetails(streamerData.game_id);
        }
      } else {
        const newDetails = {
          user: '',
          game_id: '',
          viewers: 0,
        };
        streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
      }
      this.setState({
        streamDetails
      });
    })
    .catch((err) => {
      throw err;
    });
  }

  componentDidMount() {
    const { username } = this.props.match.params;
    this.updateStreamDetails(username);
    this.connectToChat(username);
  }

  render() {
    const { streamDetails, chat } = this.state;
    return (
      <div className="Analytics-parent">
        <GameAnalytics
          viewers={streamDetails.viewers} 
          totalGameViewers={streamDetails.totalGameViewers} />
        <ChatAnalytics chat={chat} />
      </div>
    );
  }
}

export default AnalyticsPage;
