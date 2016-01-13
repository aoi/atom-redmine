'use babel';
import {$$, SelectListView} from 'atom-space-pen-views';

export default class ProjectIDsListView extends SelectListView {
  
  constructor() {
    super();
    this.addClass('redmine-projectIDs');
  }

  activate() {
  }

  getFilterKey() {
    return 'id';
  }
  
  getFilterQuery() {
    return this.filterEditorView.getText();
  }

  cancelled() {
    this.hide();
  }

  toggle(ids) {
    if (this.panel && this.panel.isVIsible()) {
      this.hide();
	} else {
	  this.show(ids);
	}
  }

  show(ids) {
    this.panel = this.panel || atom.workspace.addModalPanel({item: this});
	this.loading.text('Loading IDs ...');
	this.loadingArea.show();
	this.panel.show();

	this.setItems(ids);
	this.focusFilterEditor();

  }

  hide() {
    if (this.panel) {
      this.panel.hide();
	}
  }

  viewForItem(id) {
	return $$(function(){
	  this.li({}, id);
	});
  }

  confirmed(item) {
	this.panel.emitter.emit('SelectProjectID', item);
  }
}
