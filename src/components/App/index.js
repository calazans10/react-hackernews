import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  DEFAULT_QUERY,
  DEFAULT_PAGE,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
  URL_BASE,
} from '../../constants';
import Button from '../Button';
import Search from '../Search';
import Table from '../Table';
import './index.css';

const updateSearchTopstoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey]
    ? results[searchKey].hits
    : [];

  const updatedHits = [
    ...oldHits,
    ...hits
  ];

  return {
    results: {
      ...results,
      [searchKey]: { hits: updatedHits, page }
    }
  };
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    };
  }

  needsToSearchTopstories = (searchTerm) => {
    return !this.state.results[searchTerm];
  }

  setSearchTopstories = (result) => {
    const { hits, page } = result;
    this.setState(updateSearchTopstoriesState(hits, page));
  }

  fetchSearchTopstories = (searchTerm, page) => {
    axios.get(`${URL_BASE}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.data)
      .then(result => this.setSearchTopstories(result))
      .catch(error => console.log(error));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  }

  onSearchSubmit = (e) => {
    e.preventDefault();
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }
  }

  onDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  render() {
    const { searchTerm, results, searchKey } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
          <Table list={list} onDismiss={this.onDismiss} />
          <div className="interactions">
            <Button onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>More</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
