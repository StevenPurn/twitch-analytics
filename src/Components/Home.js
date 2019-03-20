import React from 'react';
import Toolbar from './Toolbar';

const Home = ({ history }) => <Toolbar redirect={(value) => history.push(`${value}`)} />

export default Home;
