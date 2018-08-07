import React, { Component } from 'react';
const tmi = require('tmi.js');

class ChatAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messagesByUser: {},
      topTenActiveUsers: [],
      avgMessagesPerChatter: 0,
      emoteUseCount: {},
      topTenEmotes: [],
      ignoreMessagesFrom: [],
    }

    this.onMessageHandler = this.onMessageHandler.bind(this);
    this.onConnectedHandler = this.onConnectedHandler.bind(this);
    this.onDisconnectedHandler = this.onDisconnectedHandler.bind(this);
    this.calculateMessageStats = this.calculateMessageStats.bind(this);
    this.calculateEmoteStats = this.calculateEmoteStats.bind(this);
  }

  setUsernameToIgnore(username) {
    const usersToIgnore = this.state.ignoreMessagesFrom.slice();
    if (usersToIgnore.includes(username) === false) {
      usersToIgnore.push(username);
      this.setState({
        ignoreMessagesFrom: usersToIgnore,
      });
    }
  }

  onMessageHandler(target, context, msg, self) {
    const username = context['display-name'];
    if (this.state.ignoreMessagesFrom.includes(username)){
      return;
    }
    console.log(context);
    console.log(context.emotes);
    const emotes = context['emotes'];
    if (emotes !== null) {
      const { emoteUseCount } = this.state;
      this.calculateEmoteStats(emotes, emoteUseCount);
    }

    const { messagesByUser } = this.state;
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
    let totalEmotesUsed = 0;
    const keys = Object.keys(emoteUseCount);
    for (let i = 0; i < keys.length; i += 1) {
      const useCount = emoteUseCount[keys[i]];
      totalEmotesUsed += useCount;
      newTopTenEmotes.push({ emote: keys[i], useCount });
    }

    newTopTenEmotes.sort((a, b) => b.useCount - a.useCount);

    this.setState({
      topTenEmotes: newTopTenEmotes.slice(0, 10),
      emoteUseCount
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
      newTopTenActiveUsers.push({username: keys[i], messageCount: messages });
    }

    newTopTenActiveUsers.sort((a, b) => b.messageCount - a.messageCount);

    this.setState({
      topTenActiveUsers: newTopTenActiveUsers.slice(0, 10),
      avgMessagesPerChatter: totalMessages/keys.length,
    });
  }

  onConnectedHandler(addr, port) {
    console.log(`Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler(reason) {
    console.log(`Disconnected: ${reason}`);
  }

  componentDidMount() {
    let opts = {
      identity: {
        username: 'analyticsrobot',
        password: 'oauth:995yubntaffgwmbfd3cj3yq1hovuvc'
      },
      channels: [
        this.props.channel
      ]
    }
    let client = new tmi.client(opts)
    
    client.on('message', this.onMessageHandler)
    client.on('connected', this.onConnectedHandler)
    client.on('disconnected', this.onDisconnectedHandler)
    
    client.connect()
  }

  render() {
    return (
      <div className="Viewership">
        <div>This is where messages per user will be</div>
      </div>
    );
  }
}

export default ChatAnalytics;
