import React, { Component }  from 'react';
 
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  handleSubmit({ preventDefault }) {
    preventDefault();
    this.props.redirect(`/${this.state.value}`);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            className="form-control"
            type="text"
            placeholder="Twitch username"
            value={this.state.value}
            onChange={this.handleInputChange}
          />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default Search;