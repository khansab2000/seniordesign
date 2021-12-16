import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      query: '',
      images: [],
    };
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit(event) {
    event.preventDefault();

    let query = this.state.query;

    axios.post(`http://localhost:5000/findImages`, { query: query })
      .then(res => {
        this.setState({
          images: res.search_metadata.images_results,
        });
      })
  };

  render() {
    return (
      <div className="App">
        <div className="form-group">
          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              className="form-control"
              name="query"
              placeholder="Who do you want to search?"
              onChange={this.handleInputChange}
            />
            <input type="submit" value="Search" />
          </form>
        </div>
      </div>
    );
  }
}

export default App;
