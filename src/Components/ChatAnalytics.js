import React from 'react';
import ListItems from './ListItems';
import './ChatAnalytics.css';

const ChatAnalytics = ({ chat }) => {
  const itemsToRender = [];
  if (chat.topTenEmotes){
    itemsToRender.push(<ListItems key="topTenEmotes" list={chat.topTenEmotes} title={'Top 10 Emotes'} />);
  }
  if (chat.topTenActiveUsers) {
    const avgMessages = chat.avgMessagesPerChatter.toFixed(2);
    itemsToRender.push(<ListItems key="topTenChatters" list={chat.topTenActiveUsers} title={'Top 10 Chatters'} />);
    itemsToRender.push(<h3 key="avgMessgaes">Average messages per chatting user</h3>);
    itemsToRender.push(<div key={avgMessages}>{avgMessages}</div>);
  }

  return (
    <div className="Chat-analytics-parent">
      <h1>Chat</h1>
      {chat == null ? <div>Loading...</div> : itemsToRender}
    </div>
  );
}

export default ChatAnalytics;
