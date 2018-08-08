import React from 'react';
import Toolbar from './Toolbar';

const Home = ({ history }) => {
  return (
    <div>
      <Toolbar redirect={(value) => history.push(`http://fierce-fjord-27515.herokuapp.com/${value}`)} />
    </div>
  );
}

export default Home;
