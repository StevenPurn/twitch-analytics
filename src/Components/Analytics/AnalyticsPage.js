import React, { Component } from 'react';
import GameAnalytics from './GameAnalytics';
import ChatAnalytics from './ChatAnalytics';
import { getNewChatStats, getGameData, getStreamDetails, getTotalViewersForGame } from './AnalyticsHelpers';
import { oAuth } from '../../api_key/api-key';

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
    this.addUsernameToIgnore = this.addUsernameToIgnore.bind(this);
    this.setChat = this.setChat.bind(this);
    this.setStreamDetails = this.setStreamDetails.bind(this);
    this.updateStreamDetails = this.updateStreamDetails.bind(this);
    this.onMessageHandler = this.onMessageHandler.bind(this);
    this.onConnectedHandler = this.onConnectedHandler.bind(this);
    this.onDisconnectedHandler = this.onDisconnectedHandler.bind(this);
    this.connectToChat = this.connectToChat.bind(this);
    this.handleUserJoin = this.handleUserJoin.bind(this);
    this.handleUserPart = this.handleUserPart.bind(this);
  }

  addUsernameToIgnore(username) {
    const usersToIgnore = this.state.ignoreMessagesFrom.slice();
    if (usersToIgnore.includes(username) === false) {
      usersToIgnore.push(username);
      const chat = {...this.state.chat};
      if(chat.messagesByUser.hasOwnProperty(username)) {
        delete chat.messagesByUser[username];
      }
      chat.ignoreMessagesFrom = usersToIgnore;
      this.setState({
        chat
      });
    }
  }

  onMessageHandler(channel, context, message) {
    const username = context['display-name'];
    const { emotes } = context;
    const newChat = getNewChatStats({...this.state.chat}, emotes, message, username);
    if (newChat != null) {
      this.setChat(newChat);
    }
  }

  setChat(newChat) {
    const chat = {
      ...this.state.chat,
      ...newChat
    };
    this.setState({
      chat
    });
  }

  setStreamDetails(newStreamDetails) {
    const streamDetails = {
      ...this.state.streamDetails,
      ...newStreamDetails
    };
    this.setState({
      streamDetails
    });
  }

  onConnectedHandler(addr, port) {
    console.log(`Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler(reason) {
    console.log(`Disconnected: ${reason}`);
  }

  handleUserJoin(channel, username) {
    const chat = { ...this.state.chat };
    chat.userJoinTime[username] = Date.now();
    this.setState({
      chat,
    });
  }

  handleUserPart(channel, username) {
    const chat = { ...this.state.chat };
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
    const options = {
      identity: {
        username: 'analyticsrobot',
        password: oAuth,
      },
        channels: [
          channel
        ]
      };
    const client = new tmi.client(options);
    
    client.on('message', this.onMessageHandler);
    client.on('connected', this.onConnectedHandler);
    client.on('disconnected', this.onDisconnectedHandler);
    client.on('join', this.handleUserJoin);
    client.on('part', this.handleUserPart);
    
    client.connect();
  }

  updateStreamDetails(username) {
    getStreamDetails(username)
    .then(details => {
      this.setStreamDetails(details);
      return details.game_id;
    })
    .then(gameId => {
      getGameData(gameId)
      .then(data => {
        this.setStreamDetails(data);
      });
      getTotalViewersForGame(gameId)
      .then(totalGameViewers => {
        if (totalGameViewers != null) {
          this.setStreamDetails({ totalGameViewers })
        }
      });
    });
    setTimeout(() => {
      this.updateStreamDetails(username);
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
