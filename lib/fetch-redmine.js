'use babel';

import fetch, {Headers, Request, Response} from 'node-fetch';
// import {} from 'whatwg-fetch';
import querystring from 'querystring';

export default class Redmine {

  constructor(config) {
    this.baseUrl = `https://${config.host}`;
    this.apiKey = config.apiKey;
  }

  options(method='GET') {
    return {
      // mode: 'no-cors',
      method: method,
      headers: this.headers()
    };
  }

  headers() {
    return new Headers({
      'X-Redmine-API-Key': this.apiKey
    });
  }

  fetch(path, params={}, method='GET') {
    var url = `${this.baseUrl}${path}?${querystring.stringify(params)}`,
      options = this.options(method);
	url += '&key=' + this.apiKey;
    return fetch(url, options);
  }

  getIssues(params={}) {
    return this.fetch('/issues.json', params);
  }

  updateIssue(params={}) {
	  console.log(params);

	var editor = atom.workspace.getActiveTextEditor();
	var issueID = editor.getTitle();

	var url = `https://${atom.config.get('redmine.host')}/issues`;
	url += '/' + issueID + '.json';
	url += `?key=${atom.config.get('redmine.apiKey')}`;
	console.log(editor.getText());
	var params = {
	  method: 'PUT',
	  headers: new Headers(),
	  issue: {
	    description: editor.getText();
	  }
	}
	var res = fetch(url, params);
	res.then(response => {
	  if (response.ok) {
	    console.log(response);
	  }
	});
  }

}
