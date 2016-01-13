'use babel';
import {$$, SelectListView} from 'atom-space-pen-views';
import shell from 'shell';
import fetch, {Headers, Request, Response} from 'node-fetch';
import path from 'path';
import {Directory} from 'atom';

import Issue from '../models/issue';

export default class IssuesListView extends SelectListView {

  constructor() {
    super();
    this.addClass('redmine-issues');
  }

  activate() {
    console.log('activate');
  }

  getFilterKey() {
    return 'title';
  }

  getFilterQuery() {
    return this.filterEditorView.getText();
  }

  cancelled() {
    this.hide();
  }

  toggle(issues) {
    if(this.panel && this.panel.isVisible()) {
      this.hide();
    } else {
      this.show(issues);
    }
  }

  show(request) {
    this.panel = this.panel || atom.workspace.addModalPanel({ item: this });
    this.loading.text('Loading issues ...');
    this.loadingArea.show();
    this.panel.show();
    request.then(response => {
      if(response.ok) {
        response.json().then(issues => {
          this.setItems(issues.issues);
          this.focusFilterEditor();
        });
      } else {
        this.setError(`Error: ${response.statusText}`);
      }
    });
  }

  hide() {
    if(this.panel) {
      this.panel.hide();
    }
  }

  viewForItem(issue) {
    Object.setPrototypeOf(issue, Issue.prototype);
    return $$(function() {
      this.li({class: 'two-lines redmine-issue'}, ()=> {
        this.div({ class: `redmine-issue__status redmine-issue__status--${issue.status.id} pull-right` }, issue.status.name);
        this.div({ class: `primary-line icon icon-issue-opened` }, ()=> this.span(issue.title));
        this.div({ class: 'secondary-line no-icon' }, ()=> {
          this.span('!'.repeat(issue.priority.id),
            { class: `redmine-issue__priority redmine-issue__priority--${issue.priority.id} pull-right` });

          this.span(new Date(issue.updated_on).toLocaleDateString(), { class: 'redmine-issue__updated-on pull-right' });
          this.span({ class: 'icon icon-move-right' });
		  var name = ''
		  if (issue.assigned_to != null) {
            name = issue.assigned_to.name;
		  }
          this.span(name, { class: 'redmine-issue__assigned_to'});
        });
      });
    });
  }

  confirmed(item) {
	var itemID = `${item.id}`;
    var url = `https://${atom.config.get('redmine.host')}/issues/${item.id}.json`;
	url += `?key=${atom.config.get('redmine.apiKey')}`;
	var params = {
	  method: 'GET',
	  headers: new Headers()
	};
    var res = fetch(url, params);
	res.then(response => {
	  if (response.ok) {
	    response.json().then(issues => {
		  atom.workspace.open().then(function(editor){
		    editor.insertText(issues.issue.description);
			var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
			var tmpDir = new Directory(home + path.sep + '.atom-redmine');
			if (!tmpDir.existsSync()) {
			  tmpDir.create();
			}
			editor.saveAs(tmpDir.getPath() + path.sep + itemID + ".md");
		  });
		});

	  } else {
		console.log('error');
	  }
	});
  }
}
