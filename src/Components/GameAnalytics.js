import React from 'react';
import './GameAnalytics.css';


const GameAnalytics = ({ viewers, totalGameViewers, viewTimes }) =>  {
  let percentViews = Math.floor((viewers / totalGameViewers) * 100);
  if (totalGameViewers < 1) {
    percentViews = 0;
  }
  let sum = 0;
  if (viewTimes.length > 0) {
    sum = viewTimes.reduce((a, b) => a + b);
  }
  const avgViewTime = sum / viewTimes.length;
  const minutes = Math.floor(avgViewTime / 60000);
  const seconds = ((avgViewTime % 60000) / 1000).toFixed(0);
  const readableViewTime = (seconds === 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
  return (
    <div className="Game-analytics-parent">
      <h1>Game</h1>
      <h3>Current Viewer Count</h3>
      <div className='Stat'>{viewers}</div>
      <h3>Percentage of total views for the game</h3>
      <div className='Stat'>{percentViews}%</div>
      <h3>Average view time for users</h3>
      <div className='Stat'>{readableViewTime}</div>
      <div>Note: only includes viewers who arrived after this site has loaded</div>
    </div>
  );
}

export default GameAnalytics;
