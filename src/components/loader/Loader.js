import React, {Component} from 'react';

import './Loader.css'

export default class Loader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    return (
        <div class="container-loader">
            <div class="loader"></div>
        </div>
      );
    }
}

