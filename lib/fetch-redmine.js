'use babel';

import fetch, {Headers, Request, Response} from 'node-fetch';
import Client from 'node-rest-client';
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

	var editor = atom.workspace.getActiveTextEditor();
	var title = editor.getTitle();
	var issueID = title.replace(/\.md/, '');

	var url = `https://${atom.config.get('redmine.host')}/issues`;
	url += '/' + issueID + '.json';
	
	var client = new Client.Client;

	var params = {
	  headers: {
		'Content-Type': 'application/json',
	    'X-Redmine-API-Key': this.apiKey
	  },
	  data: {
        issue: {
	      description: editor.getText()
		}
      }	
	}
	client.put(url, params, function(data, response){
	  if (response.statusCode == 200 && response.statusMessage == 'OK') {
	    atom.notifications.addSuccess(issueID + ': Update success.');
	  } else {
	    atom.notifications.addError(issueID + ': Update failed.');
	  }
	});
  }
}
