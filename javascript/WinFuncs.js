var makePOSTRequest = null;
var API_KEY = 'AIzaSyD60UyJs1CDmGQvog5uBQX1-kARqhU7fkk';


// структура дерева
//   <ul id="listId">
//   <li> (содержит ссылку taskListId) Название списка задач
//   <ul>
//   <li>
//   <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId) ===> Нажатие на DIV вызывает окно редактирования таска
//   <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox> ===> Нажатие на CHECKBOX объявляет задачу выполненной/невыполненной (отправляет запрос PUT status)
//   <span id = "t_" + taskId> Название задачи </span>
//   <div id = "divsub_" + taskId> (содержит подзадачи)
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div> ===> Нажатие на CHECKBOX объявляет подзадачу выполненной/невыполненной (отправляет запрос PUT notes)
//   ...
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   </div> // div sub
//   </div> // div task
//   </li>
//   ...
//   <li>
//   <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId)
//   <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox>
//   <span id = "t_" + taskId> Название задачи </span>
//   <div id = "divsub_" + taskId> (содержит подзадачи)
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   ...
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   </div> // div sub
//   </div> // div task
//   </li>
//   </ul> // tasks
//   </li>
//   ...
//   <li> (содержит ссылку taskListId) Название списка задач
//   <ul>
//   <li>
//   <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId)
//   <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox>
//   <span id = "t_" + taskId> Название задачи </span>
//   <div id = "divsub_" + taskId> (содержит подзадачи)
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   ...
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   </div> // div sub
//   </div> // div task
//   </li>
//   ...
//   <li>
//   <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId)
//   <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox>
//   <span id = "t_" + taskId> Название задачи </span>
//   <div id = "divsub_" + taskId> (содержит подзадачи)
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   ...
//   <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//   </div> // div sub
//   </div> // div task
//   </li>
//   </ul> // tasks
//   </li>
//   </ul>  // списки задач

function init(makePostRequestFunc) {
    var backToList = document.getElementById('href-back');
    backToList.onclick = ActionBackToList;
    makePOSTRequest = makePostRequestFunc;

    $('checkbox-with-date').addEventListener('change', OnNoDateCheckChanged);
    $('button-back-to-list').addEventListener('click', ActionBackToList);
    $('button-save_task').addEventListener('click', ActionSaveTask);
    $('button-to-subtasks').addEventListener('click', ActionToSubtasks);
    $('button-discard').addEventListener('click', ActionDiscard);
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
                var taskDiv = createTaskDiv(taskLists[i].tasks[j], taskLists[i].id);
                var span = createSimpleTextNode(taskLists[i].tasks[j].title, 't_' + taskLists[i].tasks[j].id);
                var checkBox = createCheckBoxForTask(taskLists[i].tasks[j]);
                taskDiv.appendChild(checkBox);
                taskDiv.appendChild(span);
                liChild.appendChild(taskDiv);

                var notesOrig = taskLists[i].tasks[j].notes || '';

                if (canBeConvertedToSubtasks(notesOrig)) {
                    var subTasks = convertToSubTasks(notesOrig);
                    taskDiv.subTasks = subTasks;
                    drawSubTasksDiv(taskDiv, taskLists[i].tasks[j], subTasks, 'divsub_', true);
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

// bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
//                 false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
function drawSubTasksDiv(taskDiv, task, subTasks, divNamePrefix, forMain) {
    var subTasksDiv = document.createElement('div');
    subTasksDiv.setAttribute("id", divNamePrefix + task.id);
    drawSubTasks_new(subTasksDiv, subTasks, task.id, forMain);
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

    var myDate = new MyDate();
    myDate.setStartNextHour();

    if (targ.task && targ.taskListId) {
        // removing previous divSubWatch
        if ($('watch').task) {
            removeSubTasksDivFromWatch();
        }

        $('watch').task = targ.task;
        $('watch').taskListId = targ.taskListId;

        // TODO convert this code to a function
        $('checkbox-task-completed').checked = targ.task.status == 'completed';
        $('input-task-name').value = targ.task.title;
        $('input-task-date').value = targ.task.due != null ? new MyDate(new Date(targ.task.due)).toInputValue() : myDate.toInputValue();
        var notesOrig = targ.task.notes != undefined ? targ.task.notes : '';
        $('input-task-comment').value = notesOrig;
        $('input-task-comment').style.display = '';
        $('checkbox-with-date').checked = targ.task.due != null;
        $('input-task-date').style.display = targ.task.due != null ? '': 'none';

        // show subtasks and hide notes
        if (canBeConvertedToSubtasks(notesOrig)) {
            addSubTasksDivToWatch(notesOrig);
        }

        showOneSection('watch');
    }
}

function changeNotesState(showSubTasks) {
    if (showSubTasks) {
        // проанализировать содержимое поля комментария
        // кол-во строк там = кол-ву подзадач
        // если у подзадачи есть [x] - это значит выполненная подзадача
        // если есть [] - это удаляется из описания (пока не будем делать этого)
        var notesOrig = $('input-task-comment').value;
        var subTasks = convertToSubTasksLight(notesOrig);

        drawSubTasksDiv($("div-notes"), $('watch').task , subTasks, 'divsubwatch_', false);
        $('input-task-comment').style.display = 'none';
    }
    else {
        var subTasks = getSubTasksArrFromWatchDiv();
        removeSubTasksDivFromWatch();
        $('input-task-comment').value = subTasks.join('\n');
        $('input-task-comment').style.display = '';
    }
}

function removeSubTasksDivFromWatch() {
    var subTaskDiv = document.getElementById('divsubwatch_' + $('watch').task.id);

    if (subTaskDiv) {
        subTaskDiv.parentNode.removeChild(subTaskDiv);
    }
}

function addSubTasksDivToWatch(notesOrig) {
    var subTasks = convertToSubTasks(notesOrig);
    $('watch').subTasks = subTasks;
    drawSubTasksDiv($("div-notes"), $('watch').task , subTasks, 'divsubwatch_', false);
    $('input-task-comment').style.display = 'none';
}

function getSubTasksArrFromWatchDiv() {
    var subTasksDiv = $('divsubwatch_' + $('watch').task.id);


    var num = subTasksDiv.children.length;
    var subTasks = [];

    for (var i=0; i<num; i++) {
        var checkBox = $("ch_w_" + $('watch').task.id + "_" + i);
        var textNode = $("t_w_" + $('watch').task.id + "_" + i);

        var subTask = checkBox.checked ? '[x]':'[ ]';
        subTask = subTask + textNode.innerText;
        subTasks.push(subTask);
    }

    return subTasks;
}

function createTaskDiv(task, taskListId) {
    var taskDiv = document.createElement('div');
    taskDiv.setAttribute("id", "div_" + task.id);
    taskDiv.task = task;
    taskDiv.taskListId = taskListId;
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

function drawSubTaskWatch(li, subTask, taskId, subTaskNum) {
    var span = document.createElement('div');
    var isDone = subTask.substring(0,1) == 'T';
    var text = subTask.substring(1);
    var checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.setAttribute("id", "ch_w_" + taskId + "_" + subTaskNum);
    checkBox.addEventListener('change', function(e) {
        var targ;

        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        OnChangeSubTaskStatusCB(targ);
    });

    span.appendChild(checkBox);
    span.appendChild(createSimpleTextNode(text, 't_w_' + taskId + "_" + subTaskNum));
    li.appendChild(span);

    if (isDone) {
        checkBox.checked = true;
        setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);
    }
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

// bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
//                 false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
function drawSubTasks_new(li, subTasks, taskId, forMain) {
    for (var k = 0; k< subTasks.length; k++) {
        if (subTasks[k].trim() == '') {
            continue;
        }

        if (forMain) {
            drawSubTask(li, subTasks[k], taskId, k);
        }
        else {
            drawSubTaskWatch(li, subTasks[k], taskId, k);
        }

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
    var mas = textCpy.split('\n');
    var subTasksList = [];
    var tmp;

    for (var i=0; i < mas.length; i++) {
        tmp = mas[i].trim();
        if (tmp.substring(0, 3) == '[ ]') {
            tmp = 'F' + tmp.substring(3);
        }
        else if (tmp.substring(0, 3) == '[x]') {
            tmp = 'T' + tmp.substring(3);
        }

        subTasksList.push(tmp);
    }

   // textCpy =  textCpy.split('[ ]').join('^&^F');
   // textCpy =  textCpy.split('[x]').join('^&^T');

   //var subTasksList = textCpy.split('^&^');
   return subTasksList;
}

function convertToSubTasksLight(text) {

    var textCpy = text;
    var mas = textCpy.split('\n');
    var subTasksList = [];
    var tmp;

    for (var i=0; i < mas.length; i++) {
        tmp = mas[i].trim();
        if (tmp.substring(0, 3) == '[ ]') {
            tmp = 'F' + tmp.substring(3);
        }
        else
         if (tmp.substring(0, 3) == '[x]') {
            tmp = 'T' + tmp.substring(3);
        }
        else {
             tmp = 'F' + tmp;
        }

        subTasksList.push(tmp);
    }

    // textCpy =  textCpy.split('[ ]').join('^&^F');
    // textCpy =  textCpy.split('[x]').join('^&^T');

    //var subTasksList = textCpy.split('^&^');
    return subTasksList;
}

function convertFromSubTasks(arr) {
    var str = arr.join('\n^&^');
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

function ActionBackToList() {
    showOneSection('main');
}

function ActionSaveTask() {
    if ($('watch').task != undefined && $('watch').taskListId != undefined) {
        var task = $('watch').task;
        var taskListId = $('watch').taskListId;

        var date = "";
        if ($('checkbox-with-date').checked) {
            date = new MyDate();
            date.setFromInputValue( $('input-task-date').value);
        }

        changeTaskRequest(taskListId, task, $('checkbox-task-completed').checked, $('input-task-name').value, date, $('input-task-comment').value);
    }
}

function ActionToSubtasks() {
    changeNotesState($('input-task-comment').style.display == '');
}

function ActionDiscard() {
    if ($('watch').task != undefined && $('watch').taskListId != undefined) {
        var myDate = new MyDate();
        myDate.setStartNextHour();
        var task = $('watch').task;

        // TODO convert this code to a function
        if ($('watch').task) {
            removeSubTasksDivFromWatch();
        }

        $('checkbox-task-completed').checked = task.status == 'completed';
        $('input-task-name').value = task.title;
        $('input-task-date').value = task.due != null ? new MyDate(new Date(task.due)).toInputValue() : myDate.toInputValue();
        var notesOrig = targ.task.notes != undefined ? task.notes : '';
        $('input-task-comment').value = notesOrig;
        $('input-task-comment').style.display = '';
        $('checkbox-with-date').checked = task.due != null;
        $('input-task-date').style.display = task.due != null ? '': 'none';

        // show subtasks and hide notes
        if (canBeConvertedToSubtasks(notesOrig)) {
            addSubTasksDivToWatch(notesOrig);
        }
    }

}

function changeTaskStatusRequest(taskListId, taskId, isCompleted) {
    var status = isCompleted ? 'completed':'needsAction';
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  isCompleted? '{"status":"' + status + '", "id": "'+ taskId + '"}' : '{"status":"' + status + '", "completed": null, "id": "' + taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus);
}

function changeSubTaskStatusRequest(taskListId, taskId, notes) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  '{"notes": "' + filterSpecialChar(notes) + '", "id": "'+ taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus);
}

function changeTaskRequest(taskListId, task, isCompleted, title, dueDate, notes) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + task.id + '?key=' + API_KEY;
    var data = '{"id": "'+ task.id + '"';
    var status = isCompleted ? 'completed':'needsAction';
    var hasChanges = false;

    if (task.status != status) {
        data += isCompleted? ',"status":"' + status + '"' : '{"status":"' + status + '", "completed": null';
        hasChanges = true;
    }

    if (task.title != title) {
        title = filterSpecialChar(title);
        data +=  ',"title":"' + title + '"';
        hasChanges = true;
    }

    if ((task.notes == undefined && notes != '') || (task.notes != undefined && task.notes != notes)) {
        notes = filterSpecialChar(notes);
        data += ',"notes":"' + notes + '"';
        hasChanges = true;
    }

    if ((task.due == undefined && dueDate != '' ) || (task.due != undefined && dueDate != task.due)) {
        if (dueDate != '') {
           dueDate = dueDate.toJSON();
        }


        data += dueDate != '' ? ',"due":"' + dueDate + '"' : ',"due": null' ;
        hasChanges = true;
    }

    data += '}';

    if (hasChanges) {
        makePOSTRequest(url, data, OnChangeTaskStatus);
    }
}

function OnChangeTaskStatus(obj) {
    if (obj.errors.length > 0) {
        alert('Sorry! Some error occured! ' + JSON.stringify(obj.errors[0]));
        return;
    }

    // обновляем только секцию Main (что делать с секцией Watch пока не понятно)
    if (obj.text) {
        var taskFromServer = JSON.parse(obj.text);

        if (taskFromServer) {
            var isCompleted = taskFromServer.status == "completed";
            var checkBox = document.getElementById("ch_" + taskFromServer.id);
            if (checkBox.checked != isCompleted) {
                checkBox.checked = isCompleted;
                OnChangeTaskStatusCB(checkBox);
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

                    drawSubTasksDiv(taskDiv, taskFromServer, subTasks, true);
                    // перерисовать узел subTasks
                    taskDiv.subTasks = subTasks;
                }
            }

            taskDiv.task = taskFromServer;
        }
    }
}

function filterSpecialChar(data) {
    if (data) {
        data = data.replace(/"/g, "\\\"");
        data = data.replace(/\n/g, "\\n");
        data = data.replace(/\//g, "\\/");
        data = data.replace(/\r/g, "\\r");
        data = data.replace(/\t/g, "\\t");
    }

    return data;
}

/* string id
 returns object by its id*/
function $(id) {
    return document.getElementById(id);
}

/*  No date checkbox event handler
 Hides input-task-date if checkbox not checked, shows otherwise */
function OnNoDateCheckChanged() {
    $('input-task-date').style.display = $('checkbox-with-date').checked ? '' : 'none';
}




