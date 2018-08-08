import React from 'react';
import ListItems from './ListItems';
import './ChatAnalytics.css';

const ChatAnalytics = ({ chat }) => {
  const itemsToRender = [];
  if (chat === undefined) {
    itemsToRender.push(<div>Loading</div>);
  } else {
    if (chat.topTenEmotes){
      itemsToRender.push(<ListItems list={chat.topTenEmotes} title={'Top 10 Emotes'} />);
    }
    if (chat.topTenActiveUsers) {
      itemsToRender.push(<ListItems list={chat.topTenActiveUsers} title={'Top 10 Chatters'} />);
      const avgMessages = chat.avgMessagesPerChatter.toFixed(2);
      itemsToRender.push(<h3>Average messages per chatting user</h3>);
      itemsToRender.push(<div>{avgMessages}</div>);
    }
  }

  return (
    <div className="Chat-analytics-parent">
      <h1>Chat</h1>
      {itemsToRender}
    </div>
  );
}

export default ChatAnalytics;
