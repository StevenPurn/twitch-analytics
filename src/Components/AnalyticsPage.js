import React, { Component } from 'react';
import GameAnalytics from './GameAnalytics';
import ChatAnalytics from './ChatAnalytics';
import fetchTwitch from '../fetch-twitch';
import { oAuth } from '../api_key/api-key';

const tmi = require('tmi.js');

class AnalyticsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamDetails: {
        user: '',
        game_id: '',
        gameName: '',
        viewers: 0,
        totalGameViewers: 0,
      },
      chat: {
        messagesByUser: {},
        topTenActiveUsers: [],
        avgMessagesPerChatter: 0,
        emoteUseCount: {},
        topTenEmotes: [],
        ignoreMessagesFrom: ["Nightbot"],
        userJoinTime: {},
        userViewTimes: [],
        emotes: {},
      }
    }
    this.updateStreamDetails = this.updateStreamDetails.bind(this);
    this.onMessageHandler = this.onMessageHandler.bind(this);
    this.onConnectedHandler = this.onConnectedHandler.bind(this);
    this.onDisconnectedHandler = this.onDisconnectedHandler.bind(this);
    this.calculateMessageStats = this.calculateMessageStats.bind(this);
    this.calculateEmoteStats = this.calculateEmoteStats.bind(this);
    this.connectToChat = this.connectToChat.bind(this);
    this.handleUserJoin = this.handleUserJoin.bind(this);
    this.handleUserPart = this.handleUserPart.bind(this);
  }

  setUsernameToIgnore(username) {
    const usersToIgnore = this.state.ignoreMessagesFrom.slice();
    if (usersToIgnore.includes(username) === false) {
      usersToIgnore.push(username);
      const chat = Object.assign({}, this.state.chat);
      if(chat.messagesByUser.hasOwnProperty(username)) {
        delete chat.messagesByUser[username];
      }
      chat.usersToIgnore = usersToIgnore;
      this.setState({
        chat
      });
    }
  }

  onMessageHandler(channel, context, message) {
    const username = context['display-name'];
    const { ignoreMessagesFrom } = this.state.chat;
    if (ignoreMessagesFrom.includes(username)){
      return;
    }
    const emotes = context['emotes'];
    if (emotes !== null) {
      const { emoteUseCount } = this.state.chat;
      const emoteKeys = Object.keys(emotes);
      const emoteNameToCount = {};
      for (let i = 0; i < emoteKeys.length; i += 1) {
        const [ startInd, endInd ] = emotes[emoteKeys[i]][0].split('-');
        const key = message.substring(startInd, parseInt(endInd, 10) + 1);
        emoteNameToCount[key] = emotes[emoteKeys[i]].length;
      }
      this.calculateEmoteStats(emoteNameToCount, emoteUseCount);
    }

    const { messagesByUser } = this.state.chat;
    this.calculateMessageStats(messagesByUser, username);
  }

  calculateEmoteStats(emotes, emoteUseCount) {
    const emoteKeys = Object.keys(emotes);
    for (let i = 0; i < emoteKeys.length; i += 1) {
      const count = emotes[emoteKeys[i]];
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

  handleUserJoin(channel, username) {
    const chat = Object.assign({}, this.state.chat);
    chat.userJoinTime[username] = Date.now();
    this.setState({
      chat,
    });
  }

  handleUserPart(channel, username) {
    const chat = Object.assign({}, this.state.chat);
    if(chat.userJoinTime.hasOwnProperty(username)) {
      const viewTime = Date.now() - chat.userJoinTime[username];
      chat.userViewTimes.push(viewTime);
      delete chat.userJoinTime[username];
    }
    this.setState({
      chat,
    });
  }

  connectToChat(channel) {
    let opts = {
      identity: {
        username: 'analyticsrobot',
        password: oAuth,
      },
        channels: [
          channel
        ]
      };
      let client = new tmi.client(opts);
      
      client.on('message', this.onMessageHandler);
      client.on('connected', this.onConnectedHandler);
      client.on('disconnected', this.onDisconnectedHandler);
      client.on('join', this.handleUserJoin);
      client.on('part', this.handleUserPart);
      
      client.connect();
  }

  updateGameData(gameId) {
    const originalUrl = `https://api.twitch.tv/helix/streams?game_id=${gameId}&language=en&first=100`;
    const gameStreams = [];
    let totalViews = 0;
    const getGameStreamsData = (url) => {
      let foundEnd = false;
      fetchTwitch(url)
      .then(data => {
        if (data.data === undefined) {
          console.log("Too many requests: Too many people are streaming the game to get the total viewer count");
          const newDetails = { totalGameViewers: 0 };
          const streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
          this.setState({
            streamDetails
          });
          return;
        }
        data.data.forEach((stream) => {
          if (stream.viewer_count < 1) {
            foundEnd = true;
            return;
          }
          gameStreams.push(stream);
        });
        if (foundEnd || data.data.length < 100) {
          gameStreams.forEach((stream) => {
            totalViews += stream.viewer_count;
          });
          const newDetails = { totalGameViewers: totalViews };
          const streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
          this.setState({
            streamDetails
          });
        } else {
          getGameStreamsData(originalUrl + `&after=${data.pagination.cursor}`);
        }
      })
      .catch(err => {
        throw err;
      });
    }
    const gameUrl = `https://api.twitch.tv/helix/games?id=${gameId}`;
    fetchTwitch(gameUrl)
    .then(data => {
      if (data.data) {
        const name = data.data[0].name;
        const newDetails = { gameName: name };
        const streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
        this.setState({
          streamDetails
        });
      }
    })
    .catch(err => {
      throw err;
    })
    getGameStreamsData(originalUrl);
  }

  updateStreamDetails(username) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${username}`
    fetchTwitch(url)
    .then((data) => {
      let streamDetails;
      if (data['data'].length > 0) {
        const streamerData = data['data'][0];
        if (streamerData['type'] === 'live') {
          const newDetails = {
            user: username,
            game_id: streamerData.game_id,
            viewers: streamerData.viewer_count,
          };
          streamDetails = Object.assign({}, this.state.streamDetails, newDetails);
          this.updateGameData(streamerData.game_id);
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
    setTimeout(() => {
      this.updateStreamDetails(this.props.match.params.username);
    }, 60000);
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
          gameName={streamDetails.gameName}
          viewers={streamDetails.viewers} 
          totalGameViewers={streamDetails.totalGameViewers}
          viewTimes={chat.userViewTimes} />
        <ChatAnalytics chat={chat} />
      </div>
    );
  }
}

export default AnalyticsPage;
