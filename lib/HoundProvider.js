/* @flow */
/* global atom */

import {React} from 'react-for-atom';
import Highlight from 'react-highlighter';
import request from 'request-promise';

function getResultsFromHound(query) {
  if (!query || query === '' || query.length <= 2) {
    return [];
  }

  const houndBaseURI = atom.config.get('nuclide-hound-provider.houndBaseURI');
  return request({
    uri: houndBaseURI + '/api/v1/search',
    method: 'GET',
    qs: {
      stats: 'fosho',
      repos: '*',
      q: query,
      rng: ':20',
      files: null,
      i: 'nope',
    },
    json: true,
  }).then((resp) => {
    let matches = [];
    Object.keys(resp.Results).forEach(key => {
      const repo = resp.Results[key];
      const matchesForRepo = repo.Matches.reduce((acc, match) => {
        return acc.concat(match.Matches.map(codeMatch => {
          return {
            path: match.Filename,
            line: codeMatch.LineNumber - 1,
            query,
            codeMatch,
          };
        }));
      }, []);
      matches = matches.concat(matchesForRepo);
    });
    return matches;
  });
}

export const HoundProvider: Provider = {
  name: 'HoundProvider',
  providerType: 'GLOBAL',
  debounceDelay: 250,
  display: {
    action: 'nuclide-hound-provider:toggle-provider',
    prompt: 'Search code in repo',
    title: 'Code',
  },

  executeQuery(query: string, directory: atom$Directory): Promise<Array<FileResult>> {
    return Promise.resolve(getResultsFromHound(query));
  },

  getComponentForItem(item: FileResult): React.Element<any> {
    const codeMatch = item.codeMatch;
    return (
      <div className="hound-result-item">
        <div className="file icon icon-file-text">{item.path}</div>
        <div className="hound-result-item context">
          <Line number={codeMatch.LineNumber - 2} content={codeMatch.Before[0]} />
          <Line number={codeMatch.LineNumber - 1} content={codeMatch.Before[1]} />
          <Line number={codeMatch.LineNumber} content={codeMatch.Line} query={item.query} />
          <Line number={codeMatch.LineNumber + 1} content={codeMatch.After[0]} />
          <Line number={codeMatch.LineNumber + 2} content={codeMatch.After[1]} />
        </div>
      </div>
    );
  },
};

class Line extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.number !== nextProps.number ||
      this.props.content !== nextProps.content ||
      this.props.query !== nextProps.query;
  }

  render() {
    return (
      <div className="line">
        <span className="line-number">
          {this.props.number}
        </span>
        <span className="line-content">
          {this.props.query ? <LineContent line={this.props.content} query={this.props.query} /> : this.props.content}
        </span>
      </div>
    );
  }
}

class LineContent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.query !== nextProps.query || this.props.line !== nextProps.line;
  }

  render() {
    return (
      <span className="line-content">
        <Highlight search={new RegExp(this.props.query)}>{this.props.line}</Highlight>
      </span>
    );
  }
}

