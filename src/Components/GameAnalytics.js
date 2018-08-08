import React from 'react';
import './GameAnalytics.css';


const GameAnalytics = ({ viewers, totalGameViewers }) =>  {
  let percentViews = viewers / totalGameViewers;
  return (
    <div className="Game-analytics-parent">
      <div>{percentViews}</div>
    </div>
  );
}

export default GameAnalytics;
