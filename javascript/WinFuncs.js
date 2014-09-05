var makePOSTRequest = null;
var API_KEY = 'AIzaSyD60UyJs1CDmGQvog5uBQX1-kARqhU7fkk';

function init(makePostRequestFunc) {
    var backToList = document.getElementById('href-back');
    backToList.onclick = returnToList;
    makePOSTRequest = makePostRequestFunc;
}

function generateList(taskLists) {
    var i;
    var ulMain = document.getElementById('listId');

    for (i = 0; i < taskLists.length; ++i) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(taskLists[i].title));
        li.taskListId = taskLists[i].id;
        ulMain.appendChild(li); // create <li>

        if (taskLists[i].tasks && taskLists[i].tasks.length > 0) {
            var ul = document.createElement('ul'); // assume + create <ul>
            li.appendChild(ul);

            for (var j=0; j < taskLists[i].tasks.length; j++) {
                var liChild = document.createElement('li');
                var taskDiv = createTaskDiv(taskLists[i].tasks[j]);
                var span = createSimpleTextNode(taskLists[i].tasks[j].title, 't_' + taskLists[i].tasks[j].id);
                var checkBox = createCheckBoxForTask(taskLists[i].tasks[j]);
                taskDiv.appendChild(checkBox);
                taskDiv.appendChild(span);
                liChild.appendChild(taskDiv);

                var notesOrig = taskLists[i].tasks[j].notes || '';

                if (canBeConvertedToSubtasks(notesOrig)) {
                    var subTasks = convertToSubTasks(notesOrig);
                    taskDiv.subTasks = subTasks;
                    drawSubTasksDiv(taskDiv, taskLists[i].tasks[j], subTasks);
                }

                ul.appendChild(liChild);
            } // for j
        } // if
        else {
            var ul = document.createElement('ul'); // assume + create <ul>
            var liChild = document.createElement('li');
            liChild.appendChild(document.createTextNode('<no tasks>'));
            ul.appendChild(liChild);
            li.appendChild(ul);
        }
    } // for i

    return ulMain;
}

function drawSubTasksDiv(taskDiv, task, subTasks) {
    var subTasksDiv = document.createElement('div');
    subTasksDiv.setAttribute("id", 'divsub_' + task.id);
    drawSubTasks_new(subTasksDiv, subTasks, task.id);
    taskDiv.appendChild(subTasksDiv);
}


function getNotes(task) {
    var notes = task.notes || '<Без описания>';

    if (canBeConvertedToSubtasks(notes)) {
        notes = '<Без описания>';
    }

    return notes;
}

function getDueTo(task) {
    if (task.due) {
        var d = new Date(task.due);
        return d.toDateString();
    }

    return '<Без даты>';
}

function createSimpleTextNode(text, id) {
    var span = document.createElement('span');
    span.appendChild(document.createTextNode(text));
    span.setAttribute("id", id);
    span.style.backgroundColor = 'inherit';
    return span;
}

function createColoredTextNode(text, task) {
    var span = document.createElement('span');
    span.style.fontSize = "10px";
    span.style.color = '#666666';
    span.style.textIndent = '25px';
    span.style.display = 'inline-block';
    span.style.cursor = 'pointer';
    span.appendChild(document.createTextNode(text));
    span.task = task;
    span.addEventListener('click', function(e) {
        var targ;

        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        document.getElementById('label-id').innerText = targ.task.id;
        document.getElementById('label-name').innerText = targ.task.title;
        document.getElementById('label-due-to').innerText = targ.task.due;
        document.getElementById('label-notes').innerText = targ.task.notes;
        // offsetY = window.pageYOffset;
        showOneSection('watch');
    });
    return span;
}

function OnTaskDivMouseOver(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    targ.style.background='gray';
}

function OnTaskDivMouseOut(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    targ.style.background='white';
}

function OnTaskDivClick(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    if (targ.task) {
        document.getElementById('label-id').innerText = targ.task.id;
        document.getElementById('label-name').innerText = targ.task.title;
        document.getElementById('label-due-to').innerText = targ.task.due;
        document.getElementById('label-notes').innerText = targ.task.notes;
        showOneSection('watch');
    }
}

function createTaskDiv(task) {
    var taskDiv = document.createElement('div');
    taskDiv.setAttribute("id", "div_" + task.id);
    taskDiv.task = task;
    taskDiv.addEventListener("mouseenter", OnTaskDivMouseOver, false);
    taskDiv.addEventListener("mouseleave", OnTaskDivMouseOut, false);
    taskDiv.addEventListener("click", OnTaskDivClick);
    taskDiv.style.cursor = 'pointer';
    return taskDiv;
}

function createCheckBoxForTask(task) {
    var checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.setAttribute("id", "ch_" + task.id);

    checkBox.addEventListener('change', function(e) {
        var targ;

        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        OnChangeTaskStatusCB(targ);

        var li = targ;
        while (li != null && li.task == undefined) li = li.parentNode;
        var task = li.task;

        while (li != null && li.taskListId == undefined) li = li.parentNode;

        var m_taskId = targ.id.substring('ch_'.length);
        var taskListId = li? li.taskListId: '';
        task.status = targ.checked ? 'completed' : 'needsAction';

        //backGround.loader.changeTaskStatus(taskListId, m_taskId, targ.checked);
        changeTaskStatusRequest(taskListId, m_taskId, targ.checked);
        alert(task.title + " " + taskListId);
    });

    if (task.status == 'completed') {
        checkBox.checked = true;
        setTimeout(function () { OnChangeTaskStatusCB(checkBox); }, 15);
    }
    return checkBox;
}


function drawSubTask(li, subTask, taskId, subTaskNum) {
    var span = document.createElement('div');
    span.style.paddingLeft = '25px';

    var isDone = subTask.substring(0,1) == 'T';
    var text = subTask.substring(1);
    var checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.setAttribute("id", "ch_" + taskId + "_" + subTaskNum);
    checkBox.addEventListener('change', function(e) {
        var targ;

        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        OnChangeSubTaskStatusCB(targ);

        var li = targ;

        while (li != null && li.task == undefined) li = li.parentNode;
        var m_taskId = li ? li.task.id : '';
        var oldNotes = li ? li.task.notes : '';
        var task = li.task;
        alert("task = " + JSON.stringify(li.task));

        while (li != null && li.taskListId == undefined) li = li.parentNode;


        var taskListId = li? li.taskListId: '';
        alert("taskListId = " + taskListId);
        var subTaskId = parseInt(targ.id.substring('ch_'.length).substring(m_taskId.length + 1));
        alert("subTaskId = " + subTaskId);

        var arr = convertToSubTasks(oldNotes);
        arr[subTaskId] = (targ.checked ? 'T' : 'F') + arr[subTaskId].substring('T'.length);
        var newNotes = convertFromSubTasks(arr);
        alert("newNotes = " + newNotes);
        task.notes = newNotes;
        changeSubTaskStatusRequest(taskListId, m_taskId, newNotes);
    });

    span.appendChild(checkBox);
    span.appendChild(createSimpleTextNode(text, 't_' + taskId + "_" + subTaskNum));
    li.appendChild(span);

    if (isDone) {
        checkBox.checked = true;
        setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);

    }

}

function OnChangeTaskStatusCB(targ) {
    var taskId = targ.id.substring('ch_'.length);
    var spanId = 't_' + taskId;

    document.getElementById(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
}

function OnChangeSubTaskStatusCB(targ) {
    var taskId = targ.id.substring('ch_'.length);
    var spanId = 't_' + taskId;

    var li = targ;
    while (li != null && li.taskListId == undefined) li = li.parentNode;


    document.getElementById(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
}

function drawSubTasks(subTasks, taskId) {
    var ul = document.createElement('ul');

    for (var k = 0; k< subTasks.length; k++) {
        if (subTasks[k].trim() == '') {
            continue;
        }

        var li = document.createElement('li');
        drawSubTask(li, subTasks[k], taskId, k);
        ul.appendChild(li);
    }

    return ul;
}

function drawSubTasks_new(li, subTasks, taskId) {
    for (var k = 0; k< subTasks.length; k++) {
        if (subTasks[k].trim() == '') {
            continue;
        }

        drawSubTask(li, subTasks[k], taskId, k);
    }
}

function canBeConvertedToSubtasks(text) {
    text = text.trim();
    if (text.indexOf('[ ]') != 0 && text.indexOf('[x]') != 0) {
        return false;
    }

    return true;
}

function convertToSubTasks(text) {
   if (!canBeConvertedToSubtasks(text)) {
       return null;
   }
    var textCpy = text;
    textCpy =  textCpy.split('[ ]').join('^&^F');
    textCpy =  textCpy.split('[x]').join('^&^T');

   var subTasksList = textCpy.split('^&^');
   return subTasksList;
}

function convertFromSubTasks(arr) {
    var str = arr.join('^&^');
    str = str.split('^&^F').join('[ ]');
    str = str.split('^&^T').join('[x]');
    return str;
}

// Display UI depending on OAuth access state of the gadget (see <divs> above).
// If user hasn't approved access to data, provide a "Personalize this gadget" link
// that contains the oauthApprovalUrl returned from makeRequest.
//
// If the user has opened the popup window but hasn't yet approved access, display
// text prompting the user to confirm that s/he approved access to data.  The user
// may not ever need to click this link, if the gadget is able to automatically
// detect when the user has approved access, but showing the link gives users
// an option to fetch their data even if the automatic detection fails.
//
// When the user confirms access, the fetchData() function is invoked again to
// obtain and display the user's data.
function showOneSection(toshow) {
    var sections = [ 'main', 'approval', 'waiting', 'watch' ];
    for (var i=0; i < sections.length; ++i) {
        var s = sections[i];
        var el = document.getElementById(s);
        if (s === toshow) {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    }
}

function returnToList() {
    var taskId = document.getElementById('label-id').innerText;
    showOneSection('main');
   // setTimeout( function() {window.scrollBy(0, offsetY);}, 40);
}

function changeTaskStatusRequest(taskListId, taskId, isCompleted) {
    var status = isCompleted ? 'completed':'needsAction';
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  isCompleted? '{"status":"' + status + '", "id": "'+ taskId + '"}' : '{"status":"' + status + '", "completed": null, "id": "' + taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus);
}

function changeSubTaskStatusRequest(taskListId, taskId, notes) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  '{"notes":"[ ]подзадача 1\n[ ]подзадача 2\n[x]подзадача 3", "id": "'+ taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus);
}

function OnChangeTaskStatus(obj) {
    if (obj.error) {
        alert('Sorry! Some error occured! ' + obj.error);
        return;
    }

    if (obj.text) {
        var taskFromServer = JSON.parse(obj.text);

        if (taskFromServer) {
            var isCompleted = taskFromServer.status == "completed";
            var checkBox = document.getElementById("ch_" + taskFromServer.id);
            if (checkBox.checked != isCompleted) {
                checkBox.checked = isCompleted;
            }

            var taskDiv = document.getElementById("div_" + taskFromServer.id);

            var taskSpan = document.getElementById('t_' + taskFromServer.id);
            taskSpan.innerText = taskFromServer.title;

            if (taskFromServer.notes != taskDiv.task.notes) {
                if (canBeConvertedToSubtasks(taskFromServer.notes)) {
                    var subTasks = convertToSubTasks(taskFromServer.notes);
                    var subTaskDiv = document.getElementById('divsub_' + taskFromServer.id);

                    if (subTaskDiv) {
                        subTaskDiv.parentNode.removeChild(subTaskDiv);
                    }

                    drawSubTasksDiv(taskDiv, taskFromServer, subTasks);
                    // перерисовать узел subTasks
                    taskDiv.subTasks = subTasks;
                }
            }

            taskDiv.task = taskFromServer;
        }
    }


}




