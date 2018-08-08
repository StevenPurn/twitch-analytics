import React, { Component }  from 'react';
 
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <input
            className="form-control"
            type="text"
            placeholder="Twitch username"
            value={this.state.value}
            onChange={this.handleInputChange.bind(this)}
          />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default Search;