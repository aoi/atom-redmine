'use babel';

import Redmine from './fetch-redmine';

import {CompositeDisposable} from 'atom';
import CSON from 'season';
import _path from 'path';

import shell from 'shell';

import IssuesListView from './views/issues-list-view';
import ProjectIDsListView from './views/project-ids-list-view';
import fetch, {Headers, Request, Response} from 'node-fetch';
import {File} from 'atom';

var redmine;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const CONFIG_PATH = '.atom-redmine';

export default {
  config: {
    host: {
      title: 'Redmine Host',
      description: 'The hostname of the Redmine instance.',
      type: 'string',
      default: ''
    },
    apiKey: {
      title: 'Redmine API Key',
      description: 'The Redmine api key which can be found on the My Account page',
      type: 'string',
      default: ''
    },
	projectIDs: {
	  title: 'Redmine Project IDs',
	  description: 'The Redmine Project IDs. Multiple IDs should be separeted by comma(,).',
	  type: 'string',
      default: ''
	}
  },

  subscriptions: null,

  redmine: null,
  projectId: null,

  projectIDsListView: null,
  issuesListView: null,

  activate(state) {
	var ids = this.readConfigFile();

    if(ids == null) {
      atom.notifications.addError(
        `<strong>Atom Redmine Error</strong><br/>
        <code>${CONFIG_PATH}</code> config file not found. See the README for details.`,
        { dismissable: true }
      );
      return false;
    }

	this.redmine = new Redmine({
      host: atom.config.get('redmine.host'),
      apiKey: atom.config.get('redmine.apiKey'),
      projectIDs: ids
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'redmine:my-issues': ()=> this.listIssues({ assigned_to_id: 'me' }),
      'redmine:all-issues': ()=> this.listIssues(),
      'redmine:open-project': ()=> this.openProject(),
	  'redmine:update-issue': ()=> this.updateIssue()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  readConfigFile() {
	var strIDs = atom.config.get('redmine.projectIDs');
	if (strIDs == null || strIDs == '') {
		return null;
	}
	var ids = String(strIDs).split(',');
	for (var i=0; i<ids.length; i++) {
		ids[i] = String(ids[i]).trim();
	}

    return ids;
  },

  listIssues(options={}) {
	// select projectID
	this.createProjectIDsListView().show(this.redmine.projectIDs);

	var that = this;
	this.projectIDsListView.panel.emitter.on('SelectProjectID', function(id){
      var params = {
        project_id: id, 
        sort: 'updated_on:desc'
      };
      Object.getOwnPropertyNames(options).forEach(key => params[key] = options[key]);
      var issues = that.redmine.getIssues(params);
      that.createIssuesListView().show(issues.catch(that.showError));
	});
  },

  createProjectIDsListView() {
    return this.projectIDsListView || (this.projectIDsListView = new ProjectIDsListView());
  },

  createIssuesListView() {
    return this.issuesListView || (this.issuesListView = new IssuesListView());
  },

  openProject() {
    shell.openExternal(`http://${atom.config.get('redmine.host')}/projects/${this.projectId}`);
  },

  updateIssue(options={}) {
	var params = {
	};

    this.redmine.updateIssue(params);
  },

  showError(error) {
    console.error('error in atom-redmine', error);
    // ["STATUSCODE_REJECTION 404"]
  }
};
