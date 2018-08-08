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
    }
  }

  return (
    <div className="Chat-analytics-parent">
      {itemsToRender}
    </div>
  );
}

export default ChatAnalytics;
