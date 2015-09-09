// *** QUERYSELECTORALL - WONT WORK IN IE8 ***

// cross-browser compatability evt listener fn (<IE8)
function addEventHandler(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener(eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent('on'+eventType,handler); 
}
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

// Model // +
var Model = function() {
	
	var _model 	= {},
		name,
		dueDate,
		counter = 0;

	function _resetModel() {
		for (var member in _model) {
			_removeTask(member);
		}
		counter = 0;
	}

	function _saveToLocalStorage() {
		if(typeof(Storage) !== "undefined") {
			var listName = _getName(),
				listDate = _getDate();

		    localStorage.setItem('taskMaster.'+listName, '[{"dueDate":"'+listDate+'"},' + JSON.stringify(_model) + ']' ); // store

		} else {
		    alert('Sorry, unable to save. No Web Storage support.');
		}
	}

	function _setName(listName) {
		name = listName;
	}

	function _getName() {
		return name;
	}

	function _setDate(dueDate) {
		date = dueDate.toString();
	}

	function _getDate() {
		return date;
	}

	function _addTask(obj) {
		counter += 1;
		_model[counter] = obj;
	}

	function _removeTask(task_num) {
		counter = task_num -1;
		delete _model[task_num]; 
	}

	function _updateTask(task_num, taskName) {
		_model[task_num].name = taskName;
	}

	function _checkTask(task_num) {
		_model[task_num].status = 'completed';
	}

	function _updateStatus(task_num, status) {
		_model[task_num].status = status;
	}

	function _uncheckTask(task_num) {
		_model[task_num].status = 'incomplete';
	}

	function _indentTask(evt) {
		// know what btn was clicked
		// if tasks are selected, for each one, update there indentation property
		// else update indentation property for last obj in Model
		var indent  			= evt.currentTarget.getAttribute('data-indent'),
			selectedCollection 	= document.querySelectorAll('#list [data-selected]'),
			taskDIVisCollection = (selectedCollection.length > 0) ? true : false,
			taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;

		if (taskDIVisCollection) {
			for(var i =0, ii = taskDIV.length; i < ii; i++) {
				var task_num = taskDIV[i].firstElementChild.getAttribute('data-count');
				saveIndentation(task_num, indent);
			}
		}
		else {
			var task_num = taskDIV.firstElementChild.getAttribute('data-count');
			saveIndentation(task_num, indent)
		}

		function saveIndentation(task_num, indent) {
			if (indent === 'left') {
				if (_model[task_num].indentation === 'indentLeftLeft') {
					return;
				}
				else if (_model[task_num].indentation === 'indentLeft') {
					_model[task_num].indentation = 'indentLeftLeft';
				}
				else {
					_model[task_num].indentation = 'indentLeft';
				}
			}
			else {
				if (_model[task_num].indentation === 'indentLeftLeft') {
					_model[task_num].indentation = 'indentLeft';
				}
				else {
					_model[task_num].indentation = 'none';
				}
			}
		}
	}

	function _alphabetize() {
		keys = Object.keys(model);
		keys.sort();
	}

	function _writeCSV() {
		var csvArray = [],
			csvContent;

		for (var key in _model) {
			if(_model.hasOwnProperty(key)) {
				var obj = _model[key]['name'] + ',' + _model[key]['status'];
				csvArray.push(obj);
			}
		}
		csvContent = csvArray.join("\n");
		return csvContent;
	}

	function _getTaskCnt() {
		console.log(_model);
	}

	// public
	return {
		addTask: _addTask,
		removeTask: _removeTask,
		updateTask: _updateTask,
		checkTask: _checkTask,
		updateStatus: _updateStatus,
		uncheckTask: _uncheckTask,
		indentTask: _indentTask,
		getTaskCnt: _getTaskCnt,
		resetModel: _resetModel,
		writeCSV: _writeCSV,
		setName: _setName,
		getName: _getName,
		setDate: _setDate,
		getDate: _getDate,
		saveToLocalStorage: _saveToLocalStorage,
		model: _model
	};
}();

function Task(name, status, indentation) { // Task constructor
	return {
		name: name,
		status: (status) ? status : 'incomplete',
		indentation: (indentation) ? indentation : 'none'
	};
}

// Controller
var Controller = {
	counter: 0,
	start: function() {
		this.addPlaceHolderDate();
		View.drawSavedLists();
	},
	watch: function(
		addTask,
		removeTask,
		removeBtn,
		alphabetize,
		csv,
		createList,
		saveList,
		deleteList,
		indentBtns,
		markInProgress,
		selectAll,
		createNewList,
		markIncomplete,
		markCompleted) {
	    
	    // click mark completed
	    if (markCompleted) {
	    	addEventHandler(markCompleted, 'click', function(evt) {
				evt.preventDefault();
				this.updateStatus("completed");
			}.bind(this), false);
	    }

	    // click mark incomplete
	    if (markIncomplete) {
	    	addEventHandler(markIncomplete, 'click', function(evt) {
				evt.preventDefault();
				this.updateStatus("incomplete");
			}.bind(this), false);
	    }

	    // click create new list btn
	    if (createNewList) {
	    	addEventHandler(createNewList, 'click', function(evt) {
				evt.preventDefault();
				View.markListasSaved(false);
				View.hideCreateNewList(false);
			}.bind(this), false);
	    }

	    // click select / deselect
		if (selectAll) {
			addEventHandler(selectAll, 'click', function(evt) {
				evt.preventDefault();
				this.toggleSelect();
			}.bind(this), false);
		}

		// set status 'in-progress'
	    if (markInProgress) {
	    	addEventHandler(markInProgress, 'click', function(evt) {
				evt.preventDefault();
				this.updateStatus("in progress");
			}.bind(this), false);
		}

	    // indent - unindent
	    if (indentBtns) {
	    	for (var i=0, ii = indentBtns.length; i < ii; i++) {
	    		console.log('^^^');
	    		addEventHandler(indentBtns[i], 'click', function(evt) {
					evt.preventDefault();
					this.indentTask(evt);
				}.bind(this), false);
	    	}
		}

		// save list to local storage
		if (saveList) {
			addEventHandler(saveList, 'click', function(evt) {
				evt.preventDefault();
				this.saveList();
			}.bind(this), false);
		}

		// delete list to local storage
		if (deleteList) {
			addEventHandler(deleteList, 'click', function(evt) {
				evt.preventDefault();
				this.deleteList();
			}.bind(this), false);
		}

		// create List
		if (createList) {
			addEventHandler(createList, 'submit', function(evt) {
				evt.preventDefault();
				this.createList(createList.listName.value, createList.dueDate.value || createList.dueDate.placeholder);
			}.bind(this), false);
		}

		// add task
		if (addTask) {
			addEventHandler(addTask, 'submit', function(evt) {
				evt.preventDefault(); // prevent the form from being submitted
				this.counter += 1;
	      		this.addTask(addTask.add_task_field.value, this.counter); // add to Model and View
	      		addTask.add_task_field.value = "";
	      		addTask.add_task_field.focus();
			}.bind(this), false);
		}

		// remove last task
		if (removeTask) {
			addEventHandler(removeTask, 'click', function(evt) {
				evt.preventDefault();
				this.remove();			
			}.bind(this), false);
		}

		// remove completed tasks
		if (removeBtn) {
			addEventHandler(removeBtn, 'click', function(evt) {
				evt.preventDefault();
				this.removeCompleted();			
			}.bind(this), false);
		}

		// alphabetize
		if (alphabetize) {
			addEventHandler(alphabetize, 'click', function(evt) {
				evt.preventDefault();
				this.alphabetize();
			}.bind(this), false);
		}
		// write
		if (csv) {
			addEventHandler(csv, 'click', function(evt) {
				evt.preventDefault();
				this.writeCSV();
			}.bind(this), false);
		}
	},
	toggleSelect: function() {
		var select = (document.querySelectorAll('#meta span + span')[0].getAttribute('class') === "orange") ? false : true;
		View.toggleSelect(select);
	},
	updateStatus: function(status) {
		var selected = document.querySelectorAll('#list [data-selected]');

		for (var i=0, ii = selected.length; i < ii; i++) {
			var chbx 	= selected[i].firstElementChild,
				taskObj = chbx.getAttribute('data-count');

			Model.updateStatus(taskObj, status);
			View.updateStatus(chbx, status);
		}
	},
	indentTask: function(evt) {
		console.log('%%%%');
		Model.indentTask(evt);
		View.indentTask(evt);
	},
	addPlaceHolderDate: function() { 
		var d 			= new Date(),
		    m 			= d.getMonth() + 1,
		    day 		= d.getDate(),
		    year 		= d.getFullYear(),
			dateString 	= m + "/" + day + "/" + year;

			document.getElementsByName("dueDate")[0].placeholder = dateString;
	},
	validateDate: function(year, month, day) {
	    var d = new Date(year, month, day);
	    if (d.getFullYear() == year && d.getMonth() == month && d.getDate() == day) {
	        return true;
	    }
	    return false;
	},
	saveList: function() {
		Model.saveToLocalStorage();
		var x = true;
		View.markListasSaved(true);
		View.drawSavedLists(x);
	},
	deleteList: function() {
		View.deleteList();
		View.markListasSaved(false);
	},
	createList: function(listName, dueDate, tasks) {
		// remove from Model
		Model.resetModel();

		var dueDate = dueDate.split('/');
		
		// if date is valid
		if (this.validateDate(dueDate[2], dueDate[0], dueDate[1])) {
			Model.setName(listName);
			Model.setDate(dueDate.join('/'));
			View.addList(listName, dueDate);
 			
 			// remove previous list items
 			for (var i =0, ii = this.counter; i < ii; i++) {
 				this.remove();
 			}

 			this.counter = 0;
			if (tasks) { // if from localStorage
				for (var member in tasks) {
					if (tasks.hasOwnProperty(member)) {
				        Controller.counter = parseInt(member);
				        console.log("member# " + member);				       
				        this.addTask(tasks[member].name, member, tasks[member].status, tasks[member].indentation);
				    }
				}
			}
		}
		else {
			View.invalidDate();
		}
		View.markListasSaved(false);
		View.checkSelectNumber();
	},
	addTask: function(name, num, status, indentation) {
		var taskName 	= (Array.isArray(name)) ? name[0] : name,
			taskStatus 	= (Array.isArray(name) && name[1] !== 'null') ? name[1] : false,
			taskStatus  = taskStatus || status,
			taskStatus  = (taskStatus === 'in-progress') ? 'in progress' : taskStatus,
			indentation = (typeof indentation === 'undefined') ? ((Array.isArray(name) && name[2] !== 'null') ? name[2] : false) : indentation, 
			taskObj 	= new Task(taskName, taskStatus, indentation);

		Model.addTask(taskObj);
		View.renderAddition(name, num, status, indentation);
	},
	updateTask: function(count, taskName) {
		Model.updateTask(count, taskName);
		View.updateTask(count, taskName);
	},
	remove: function(evt) {
		var	selectedCollection	= document.querySelectorAll('#list [data-selected]'),
			taskDIVisCollection = (selectedCollection.length > 0) ? true : false, 
			taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;
		
			// remove selected tasks
			if (taskDIVisCollection) { 
				for (var i =0, ii = taskDIV.length; i < ii; i++) {
					this.counter -= 1;

					//Model.removeTask(taskDIV[i].firstElementChild.getAttribute('data-count'));
					//Model.updateCounts();

					View.removeTask(taskDIV[i]);
					//View.updateCounts();
				}
			}
			// remove last task
			else { 
				this.counter -= 1;

				//Model.removeTask(taskDIV.firstElementChild.getAttribute('data-count'));
				View.removeTask(taskDIV);
				//View.updateCounts();
			}

			this.redraw(false);
	},
	removeCompleted: function() {
		// for each key in model, if has checked value true, delete from object
		var checkedB = document.querySelectorAll('#list [type=checkbox]');
		for (var i = 0, ii = checkedB.length; i < ii; i++) {
			if (checkedB[i].checked) {
				//Model.removeTask(checkedB[i].getAttribute('data-count')); // Model

				var taskDIV = checkedB[i].parentNode; // View
				View.removeTask(taskDIV); 
			}
		}

		this.redraw(false);			
	},
	toggleChecked: function(evt) {
		var chbxClicked = evt.target.tagName === "INPUT";

		if (chbxClicked) {
			var taskObj = evt.target.getAttribute('data-count'),
			    checked = evt.target.checked,
			    chbx  	= evt.target;
		}
		// else if (evt.target.tagName === "DIV") {
		// 	var taskObj 	= evt.target.firstElementChild.getAttribute('data-count'),
		// 	    checked 	= evt.target.firstElementChild.checked,
		// 	    chbx  		= evt.target.firstElementChild,
		// 	    inProgress 	= (evt.target.getAttribute("class") === 'in-progress') ? true : false;
		// }
		// else if (evt.target.tagName === "LABEL") {
		// 	var taskObj 	= evt.target.previousElementSibling.getAttribute('data-count'),
		// 	    checked 	= evt.target.previousElementSibling.checked,
		// 	    chbx  		= evt.target.previousElementSibling,
		// 	    inProgress 	= (evt.target.parentElement.getAttribute("class") === 'in-progress') ? true : false;
		// }
		// else if (evt.target.tagName === "span") {
		// 	View.selectedTask(evt);
		// }

		// uncheck chbx || click div when chbx was checked   
		if ( (!checked && chbxClicked) /*|| (checked && !chbxClicked)*/ ) {
			Model.uncheckTask(taskObj);
			View.incompleted(chbx);
		}
		// else if (!chbxClicked && !checked && !inProgress) {
		// 	Model.inProgressTask(taskObj);
		// 	View.inprogress(chbx);
		// }
		else {
			Model.checkTask(taskObj);
			View.completed(chbx);
		}	
	},
	toggleSelected: function(evt) {
		var taskDIV = evt.currentTarget.parentElement,
			taskObj = taskDIV.getAttribute('data-count');

		if (taskDIV.getAttribute('data-selected') === "true") {
			//Model.inProgressTask(taskObj);
			View.unselectTask(taskDIV);
		}
		else {
			//Model.inProgressTask();
			View.selectTask(taskDIV);
		}
	},
	alphabetize: function() {
		this.redraw(true);
	},
	redraw: function(alphabetize) {
		// remove from Model
		Model.resetModel();
		
		var list 	= document.getElementById("list");
		// get all input.names in #list
		    tasks   = document.querySelectorAll('#list [type=checkbox]');
		    if (tasks) {
		    	var nameArray = [];
		    	
		    	for (i =0, ii =tasks.length; i < ii; i++) {
		    		nameArray.push([tasks[i].name, tasks[i].parentElement.getAttribute('class'), tasks[i].parentElement.getAttribute('data-indent')]);
		    	}

		    	if (alphabetize) {
			    	nameArray.sort(function (a, b) {
					    return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
					});
			    }
		    }

		// remove unalphabetized list from View
		while (list.firstChild) {
		   list.removeChild(list.firstChild);
		}
		// add alphabetized list to view
		for (i=0, ii =nameArray.length; i < ii; i++) {
			this.addTask(nameArray[i], i+1);
		}
	},
	writeCSV: function() {
		View.writeCSV(Model.writeCSV());
	}
};

// View
var View = {
	resetCreateListForm: function() {
		document.getElementById('createList').reset();
	},
	markListasSaved: function(saved) {
		var listName = document.getElementById('listName');

		if (saved) {
			listName.setAttribute('data-saved', 'true');
		}
		else {
			listName.removeAttribute('data-saved');
		}
	},
	drawSavedLists: function(clickedSave) {
		console.log(clickedSave);
		if (typeof clickedSave !== "undefined" && clickedSave) { 
			alert("List saved!");
		}
		var sidebar = document.getElementsByClassName('sidebar')[0];
		sidebar.innerHTML = '';
		for (var i =0, ii = localStorage.length; i < ii; i++) {
			if (/^taskMaster/.test(localStorage.key(i))) {
				var list = JSON.parse(localStorage.getItem(localStorage.key(i)));
				sidebar.innerHTML += '<span class="savedList"><span>' + localStorage.key(i).slice(11) + '</span><span class="savedListDates">' + list[0].dueDate + '</span></span>';
			}
		}
		
		// + add evt listeners to newly created content
		var savedLists = document.getElementsByClassName('savedList');
		for (var i = 0, ii = savedLists.length; i < ii; i++) {
			addEventHandler(savedLists[i], 'click', function(evt) {
				evt.preventDefault();
				
				var titleSpan = evt.currentTarget.firstElementChild,
					listName  = titleSpan.innerHTML,
					dueDate   = titleSpan.nextElementSibling.innerHTML,
					tasks 	  = window.localStorage.getItem("taskMaster." + listName),
					tasks 	  = JSON.parse(tasks),
					tasks     = tasks[1];

				Controller.createList(listName, dueDate, tasks);
				View.markListasSaved(true);
			});
		}
	},
	deleteList: function() {
		if (confirm("Are you sure you want to delete this list?")) {
			var listName 		= document.getElementById('listName'),
				listNameText 	= listName.childNodes[0].nodeValue,
				listIsSaved     = (listName.getAttribute('data-saved') === "true") ? true : false,
				localStorageKey = "taskMaster." + listNameText;
				regExKey 		= new RegExp(localStorageKey, 'g');

			// if list is saved, delete from local storage
			if (listIsSaved) {
				for (var i =0, ii = localStorage.length; i < ii; i++) {
					if (regExKey.test(localStorage.key(i))) {
						console.log("removed " + localStorageKey);
						localStorage.removeItem(localStorageKey);
					}
				}
			}

			// update saved lists column
			this.drawSavedLists();
			// delete from View
			var tasks = document.querySelectorAll('#list > div');
			for (var i =0, ii = tasks.length; i < ii; i++) {
				this.removeTask(tasks[i])
			}
			// delete from Model
			Model.resetModel();
			// go to create new list view
			this.hideCreateNewList(false);
		}
		else {
			return;
		}
	},
	addList: function(listName, dueDate) {
		 var h1	= document.getElementById("listName"),
			 dueDate = new Date(dueDate.join('/'));
		 
		 h1.innerHTML = listName + "<span>Due on <strong>" + dueDate.toDateString() + "</strong></span>";
		 
		 this.hideCreateNewList(true);
	},
	hideCreateNewList: function(hideCreateNewList) {
		if (hideCreateNewList) {
			document.getElementById("createList").setAttribute("class", "hide");
			document.getElementById("input").removeAttribute("class", "");
			this.resetCreateListForm();
		}
		else {
			this.resetCreateListForm();
			document.getElementById("createList").removeAttribute("class", "");
			document.getElementById("input").setAttribute("class", "hide");
		}
	},
	renderAddition: function(name, num, status, indentation) {
	    var list 				= document.getElementById("list"),
	    	dv   				= document.createElement("div"),
	    	chbx  				= document.createElement('input'),
			label 				= document.createElement('input'),
			radio 				= document.createElement('span'),
			indentation 		= (indentation === 'none') ? false : indentation;
	
			chbx.type 			= "checkbox";
			chbx.name 			= (Array.isArray(name)) ? name[0] : name;
			chbx.setAttribute('data-count', num);

			label.value		 	= chbx.name;
			label.type 			= "text";
			label.title 		= "Edit Task";

			radio.setAttribute('class', 'radio');
			dv.setAttribute('draggable','true');
			dv.setAttribute('ondragstart','drag(event)');
			dv.setAttribute('id', Controller.counter);
			dv.appendChild(chbx);
			dv.appendChild(label);
			dv.appendChild(radio);

			if (indentation) dv.setAttribute('data-indent', indentation);

			if (Array.isArray(name) && name[1] !== null) {
				dv.setAttribute('class', name[1]);
				if (name[1] === 'completed') chbx.checked = true; 
	    	}
	    	else if (status === 'in progress') { 
	    		dv.setAttribute('class', 'in-progress');
	    	}
	    	else if (status === 'completed') {
	    		dv.setAttribute('class', status);
	    		chbx.checked = true;
	    	}

	    list.appendChild(dv);

	    // add event listeners to dynamically-created content
	    addEventHandler(chbx, 'change', function(evt) { // checkbx
	    	evt.stopPropagation();
	    	Controller.toggleChecked(evt);
		});
		 addEventHandler(radio, 'click', function(evt) {   // task div
		 	evt.stopPropagation();
	    	Controller.toggleSelected(evt); 
		});
		 addEventHandler(label, 'keyup', function(evt) { // checkbx
	    	evt.stopPropagation();
	    	console.log(num, this.value);
	    	Controller.updateTask(num, this.value);
		});
 	},
	updateTask: function(num, taskName) {
		console.log
		document.querySelectorAll('input[data-count="'+num+'"]')[0].setAttribute('name', taskName);
		console.log('%%');
	},
	updateCounts: function() {
		var tasks = document.querySelectorAll('#list input[data-count]');

		for (var i =0, ii = tasks.length; i < ii; i++) {
			tasks[i].setAttribute('data-count', i+1);
		}
	},
	removeTask: function(taskDIV) {
		var parent = taskDIV;
		
		while (parent !== null && parent.firstChild) {
		    parent.removeChild(parent.firstChild);
		}
		
		if (parent !== null) parent.remove();

		this.checkSelectNumber();
	},
	completed: function(chbx) {
		chbx.checked = true;
		chbx.parentElement.removeAttribute("class");
		chbx.parentElement.setAttribute("class", "completed");
	},
	updateStatus: function(chbx, status) {
		var taskDIV = chbx.parentElement,
			status  = (status === "in progress") ? "in-progress" : status;

		if (status === 'completed') { // check if completed
			chbx.checked = true;
		}
		else {
			chbx.checked = false;
		}
		taskDIV.removeAttribute("class");
		taskDIV.setAttribute("class", status);
		this.unselectTask(taskDIV);
	},
	incompleted: function(chbx) {
		chbx.checked = false;
		chbx.parentElement.removeAttribute("class");
	},
	selectTask: function(taskDIV) {
		var selectText = document.querySelectorAll('#meta span + span')[0];
		taskDIV.setAttribute('data-selected', 'true');
		selectText.setAttribute('class', 'orange');
		selectText.innerHTML = 'Deselect &xvee;';
	},
	unselectTask: function(taskDIV) {
		taskDIV.removeAttribute('data-selected');
		this.checkSelectNumber();
	},
	toggleSelect: function(select) {
		var tasks = document.querySelectorAll('#list > div');
		for (var i =0, ii = tasks.length; i < ii; i++) {
			if (select) { // select all unselected
				this.selectTask(tasks[i]);
			}
			else { // unselect all selected
				if (tasks[i].getAttribute('data-selected') === "true") {
					this.unselectTask(tasks[i]);
				}
			}
		}
	},
	checkSelectNumber: function() {
		if (document.querySelectorAll('[data-selected]').length < 1) {
			document.querySelectorAll('#meta span + span')[0].removeAttribute('class');
			document.querySelectorAll('#meta span + span')[0].innerHTML = 'Select &xvee;';
		}
	},
	indentTask: function(evt) {
		var indent  			= evt.currentTarget.getAttribute('data-indent'),
			selectedCollection 	= document.querySelectorAll('#list [data-selected]'),
			taskDIVisCollection = (selectedCollection.length > 0) ? true : false,
			taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;

		if (taskDIVisCollection) {
			for(var i =0, ii = taskDIV.length; i < ii; i++) {
				drawIndentation(indent, taskDIV[i]);
			}
		}
		else {
			drawIndentation(indent, taskDIV)
		}

		function drawIndentation(indent, taskDIV) {
			if (indent === 'left') {
				if (taskDIV.getAttribute('data-indent') === 'indentLeftLeft') {
					return;
				}
				else if (taskDIV.getAttribute('data-indent') === 'indentLeft') {
					taskDIV.setAttribute('data-indent', 'indentLeftLeft');
				}
				else {
					taskDIV.setAttribute('data-indent', 'indentLeft');
				}
			}
			else {
				if (taskDIV.getAttribute('data-indent') === 'indentLeftLeft') {
					taskDIV.setAttribute('data-indent', 'indentLeft');
				}
				else {
					taskDIV.removeAttribute('data-indent');
				}
			}
		}
	},
	writeCSV: function(csvString) {

		var form 		= document.getElementById('input'),
			textarea 	= document.createElement("textarea"),
			oldField    = document.getElementsByClassName('csvTextarea'),
			isOld       = (oldField.length > 0 ) ? true : false;

			if (isOld) oldField[0].remove(); // remove current textarea
			textarea.textContent = csvString;
			textarea.setAttribute('class', 'csvTextarea');
		form.appendChild(textarea);
	}
}

Controller.start(); // +
Controller.watch(
	document.getElementById('input'),
	document.getElementById('removeTask'),
	document.getElementById('removeBtn'),
	document.getElementById('alphabetize'), 
	document.getElementById('csv'), 
	document.getElementById('createList'), 
	document.getElementById('saveList'), 
	document.getElementById('removeList'), 
	document.querySelectorAll('button[data-indent]'),
	document.getElementById('mark-in-progress'),
	document.getElementById('select'),
	document.getElementById('createNewList'),
	document.getElementById('mark-incomplete'),
	document.getElementById('mark-completed')
); // +

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    // find the y coordinate where dropped
    // find the list item (if there is one) where the y coordinate exists
    // append the drag el next to list item
    
    //The Node.insertBefore() method inserts the specified node before a reference node as a child of the current node.
	//var insertedNode = parentNode.insertBefore(newNode, referenceNode);	
    
    ev.target.appendChild(document.getElementById(data));
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}