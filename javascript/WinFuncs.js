var makePOSTRequest = null;
var API_KEY = 'AIzaSyD60UyJs1CDmGQvog5uBQX1-kARqhU7fkk';
var isDrawingMainList = false;

var StatusImagesNames = (function() {
    var URL_IMAGES_FOLDER = "https://raw.githubusercontent.com/Appiens/daybyday_gadget/master/images/";
    var urlAlarm = URL_IMAGES_FOLDER + "ic_tiny_alarm_light.png";
    var urlOverdue = URL_IMAGES_FOLDER + "ic_tiny_overdue_light.png";
    var urlRepeat = URL_IMAGES_FOLDER + "ic_tiny_repeat_light.png";
    var urlPriorityHigh = URL_IMAGES_FOLDER + "ic_tiny_priority_low_light.png";
    var urlPriorityLow = URL_IMAGES_FOLDER + "ic_tiny_priority_high_light.png";

    return {
        PREFIX_ALARM : "img_alm_",
        PREFIX_REPEAT: "img_rpt_",
        PREFIX_OVERDUE: "img_ovr_",
        PREFIX_PRIORITY_HIGH: "img_phi_",
        PREFIX_PRIORITY_LOW: "img_plo",
        URL_ALARM: urlAlarm,
        URL_OVERDUE: urlOverdue,
        URL_REPEAT: urlRepeat,
        URL_PRIORITY_HIGH: urlPriorityHigh,
        URL_PRIORITY_LOW: urlPriorityLow
    };})();

var MainSectionPrefixes = (function() {
    return {
        PREFIX_UL_TASKLIST: "ul_",
        PREFIX_LI_TASK: "li_",
        PREFIX_LI_NO_TASKS: "emp_",
        PREFIX_DIV_TASK: "div_",
        PREFIX_SPAN_TITLE: "t_",
        PREFIX_CB_COMPLETED: "ch_",
        PREFIX_DIV_SUBTASK: "divsub_",
        PREFIX_CB_SUBTASK_COMPLETED: "ch_",
        PREFIX_SPAN_SUBTASK_TITLE: "t_",
        PREFIX_ARROW_TITLE: 'ar_'
    };})();

var WatchSectionPrefixes = (function() {
    return {
        PREFIX_DIV_SUBTASK: "divsubwatch_",
        PREFIX_CB_SUBTASK_COMPLETED: "ch_w_",
        PREFIX_SPAN_SUBTASK_TITLE: "t_w_"
    };})();

var TaskStatuses = (function() {
    return {
        COMPLETED: "completed",
        NEEDS_ACTION: "needsAction"
    };})();

// структура дерева
//   <ul id="listId">
//   <li> (содержит ссылку taskListId, taskList) Название списка задач
//   <ul id = "ul_" + taskListId> (список задач)
//   <li id= "emp_" + taskListId> (есть есть другие li в списке - секция скрыта, иначе отображена)
//   <span> <no tasks> </span>
//   </li>
//   <li id="li_" + taskId> (именно его нужно удалить при удалении таска)
//
//   <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId) ===> Нажатие на DIV вызывает окно редактирования таска
//   <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox> ===> Нажатие на CHECKBOX объявляет задачу выполненной/невыполненной (отправляет запрос PUT status)
//   <img id = "img_alm_" + taskId> // признак напоминания скрыт если нет напоминания, отображён - если есть
//   <img id = "img_rpt_" + taskId> // признак повторяющейся задачи скрыт если нет, отображён если есть
//   <img id = "img_ovr_" + taskId> // признак просроченной задачи скрыт если нет, отображён если есть
//   <img id = "img_phi_" + taskId> // признак высокого приоритета - скрыт если нет, отображён если есть
//   <img id = "img_plo_" + taskId> // признак низкого приоритета - скрыт если нет, отображён если есть
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
//   <img id = "img_alm_" + taskId> // признак напоминания скрыт если нет напоминания, отображён - если есть
//   <img id = "img_rpt_" + taskId> // признак повторяющейся задачи скрыт если нет, отображён если есть
//   <img id = "img_ovr_" + taskId> // признак просроченной задачи скрыт если нет, отображён если есть
//   <img id = "img_phi_" + taskId> // признак высокого приоритета - скрыт если нет, отображён если есть
//   <img id = "img_plo_" + taskId> // признак низкого приоритета - скрыт если нет, отображён если есть
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



// структура секции Watch
//
// $('watch').task  содержат задачу
// $('watch').taskListId содержит id списка задач - оба эти значения должны соответствовать серверу (если пришёл апдейт редактируемой задачи, нужно выбросить пользователя из редактирования в основной список)
// у гугла происходит выброс в секцию списка
// <div id='div-status-images'> дочерние img создаются динамически
//    <img id = "img_alm_watch"> // признак напоминания скрыт если нет напоминания, отображён - если есть (показывается то, что получилось в результате редактирования)
//    <img id = "img_rpt_watch"> // признак повторяющейся задачи скрыт если нет, отображён если есть (показывается то, что получилось в результате редактирования)
//    <img id = "img_ovr_watch"> // признак просроченной задачи скрыт если нет, отображён если есть (показывается то, что получилось в результате редактирования)
//    <img id = "img_phi_watch"> // признак высокого приоритета - скрыт если нет, отображён если есть (показывается то, что получилось в результате редактирования)
//    <img id = "img_plo_watch"> // признак низкого приоритета - скрыт если нет, отображён если есть (показывается то, что получилось в результате редактирования)
// </div>
//  <div id="div-notes" class="new-select-style-wpandyou"> => сюда же привязываются таски
//  <textarea name="input-task-comment" id="input-task-comment" rows="5" placeholder="__MSG_notes_default__"></textarea>
//  <div id = "divsubwatch_" + taskId> (содержит подзадачи)
//   <div><checkbox id= "ch_w_" + taskId + "_" + subTaskNum></checkbox><span id="t_w_" + taskId + "_" + subTaskNum > Название подзадачи</span></div> ===> Нажатие на CHECKBOX объявляет подзадачу выполненной/невыполненной (отправляет запрос PUT notes)
//   ...
//   <div><checkbox id= "ch_w_" + taskId + "_" + subTaskNum></checkbox><span id="t_w_" + taskId + "_" + subTaskNum > Название подзадачи</span></div>
//   </div> // div sub
// </div>

function init(makePostRequestFunc) {
    makePOSTRequest = makePostRequestFunc;

    $('checkbox-with-date').addEventListener('change', OnNoDateCheckChanged);
    $('button-back-to-list').addEventListener('click', ActionBackToList);
    $('button-save_task').addEventListener('click', ActionSaveTask);
    $('button-to-subtasks').addEventListener('click', ActionToSubtasks);
    $('button-discard').addEventListener('click', ActionDiscard);

    createTaskStatusImagesWatch();

    // TODO add Event listeners to subTasks checkboxes or edit boxes
    $('checkbox-task-completed').addEventListener('change', OnSomeEditDone);
    $('input-task-name').addEventListener('change', OnSomeEditDone);
    $('checkbox-with-date').addEventListener('change', OnSomeEditDone);
    $('input-task-date').addEventListener('change', OnSomeEditDone);
    $('input-task-comment').addEventListener('change', OnSomeEditDone);
    $('checkbox-with-date').addEventListener('change', OnSomeEditDone);
}

/*generates the tasks tree in a main section*/
function generateList(taskLists) {
    var i;

    isDrawingMainList = true;
    var ulMain = document.getElementById('listId');

    // clear the list
    while( ulMain.firstChild ){
        ulMain.removeChild( ulMain.firstChild );
    }

    // fill the list
    for (i = 0; i < taskLists.length; ++i) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(taskLists[i].title));
        li.taskListId = taskLists[i].id;
        li.taskList = taskLists[i];
        ulMain.appendChild(li); // create <li>

        var ul = document.createElement('ul'); // assume + create <ul>
        ul.setAttribute("id", MainSectionPrefixes.PREFIX_UL_TASKLIST + taskLists[i].id);
        li.appendChild(ul);

        DrawTasksForTaskList(taskLists[i], ul);
    } // for i

    isDrawingMainList = false;

    return ulMain;
}

/* Updates a task list from taskListsTmp asked from server, in this list we get tasks which were created/updated/deleted during last 5 mins*/
/* Применение изменений, полученных с сервера, к отображаемому списку ul*/
/*array[] taskLists - task Lists that we got from request*/
function processTmpList(taskLists) {
    var i;

    for (i = 0; i < taskLists.length; ++i) {
        if (taskLists[i].tasks && taskLists[i].tasks.length > 0) {
            for (var j = 0; j < taskLists[i].tasks.length; j++) {

                // main list is refreshing, we MUST stop the updating process
                if (isDrawingMainList) {
                    break;
                }

                // если получаем таск, который редактируется в данный момент, выбрасываем пользователя в секцию Main, если были в секции Watch
                if ($('watch').style.display != 'none' && $('watch').task && $('watch').task.id == taskLists[i].tasks[j].id) {
                    ActionBackToList();
                }

                if (taskLists[i].tasks[j].deleted) {
                    try {
                        DeleteTask(taskLists[i].tasks[j], taskLists[i].id);
                    }
                    catch (e) {
                        console.log("Error deleting task " + taskLists[i].tasks[j].id + ' ' + e);
                    }

                    continue;
                }

                try {
                   if ($(MainSectionPrefixes.PREFIX_DIV_TASK + taskLists[i].tasks[j].id)) {
                       UpdateTask(taskLists[i].tasks[j]);
                   }
                   else {
                       InsertTask(taskLists[i].id, taskLists[i].tasks[j], $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskLists[i].id));
                   }

                }
                catch (e) {
                   console.log("Error inserting/updating task " + taskLists[i].tasks[j].id + ' ' + e);
                }
            } // for j
        }
    } // for i
}

/* Draws child tasks for a task list
 object taskList - a task list to draw
 object ul - an ul section - a parent for <li> sections (which are tasks) */
function DrawTasksForTaskList(taskList, ul) {
    AddNoTasksElement(taskList, ul);

    if (taskList.tasks && taskList.tasks.length > 0) {

        for (var j=0; j < taskList.tasks.length; j++) {
            InsertTask(taskList.id, taskList.tasks[j], ul);
        } // for j
    } // if
    else {
        $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskList.id).style.display = '';
    }
}

/*Adds <no task> element to each task List ul section*/
function AddNoTasksElement(taskList, ul) {
    var liChild = document.createElement('li');
    liChild.setAttribute("id", MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskList.id);
    liChild.appendChild(document.createTextNode('<no tasks>'));
    liChild.style.display = 'none';
    ul.appendChild(liChild);
}

// <editor-fold desc="Creating elements for a MAIN div">

// Creates Sub Tasks Div section And Adds it to taskDiv section as a child
// object taskDiv - the parent div for a subTasksDiv
// task - the task which is connected to a task Div
// string[] subTasks - array of subTasks
// divNamePrefix - prefix for a SubTasks
// bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
//                 false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
function createSubTasksDiv(taskDiv, task, subTasks, divNamePrefix, forMain) {
    var subTasksDiv = document.createElement('div');
    subTasksDiv.setAttribute("id", divNamePrefix + task.id);
    drawSubTasks_new(subTasksDiv, subTasks, task.id, forMain);
    taskDiv.appendChild(subTasksDiv);
}

// Creates a span with id = id and innerText = text
// string text - a text to write in a span
// id - the id of a span, which allows to change innerText later
// returns an [object span] which should be added to some parent element
function createSimpleTextNode(text, id) {
    var span = document.createElement('span');
    span.appendChild(document.createTextNode(text));
    span.setAttribute("id", id);
    span.style.backgroundColor = 'inherit';
    return span;
}

// Creates a task div
// task - the task which is connected to a task Div
// int taskListId - the task list id to which this task belongs
// returns an [object taskDiv] which should be added to some parent element
function createTaskDiv(task, taskListId) {
    var taskDiv = document.createElement('div');
    taskDiv.setAttribute("id", MainSectionPrefixes.PREFIX_DIV_TASK + task.id);
    taskDiv.task = task;
    taskDiv.taskListId = taskListId;
    taskDiv.addEventListener("mouseenter", OnTaskDivMouseOver, false);
    taskDiv.addEventListener("mouseleave", OnTaskDivMouseOut, false);
    return taskDiv;
}

// Creates status images and adds them to a task Div, we should show/hide them when task status changes
// object taskDiv - a parent div for images
// task -  the task which is connected to a task Div
function createTaskStatusImages(taskDiv, task) {
    var imgOverdue = createTaskStatusImg(StatusImagesNames.URL_OVERDUE, task, StatusImagesNames.PREFIX_OVERDUE);
    taskDiv.appendChild(imgOverdue);
    var imgAlarm = createTaskStatusImg(StatusImagesNames.URL_ALARM, task, StatusImagesNames.PREFIX_ALARM);
    taskDiv.appendChild(imgAlarm);
    var imgRepeat = createTaskStatusImg(StatusImagesNames.URL_REPEAT, task, StatusImagesNames.PREFIX_REPEAT);
    taskDiv.appendChild(imgRepeat);
    var imgPriorityHigh = createTaskStatusImg(StatusImagesNames.URL_PRIORITY_HIGH, task, StatusImagesNames.PREFIX_PRIORITY_HIGH);
    taskDiv.appendChild(imgPriorityHigh);
    var imgPriorityLow = createTaskStatusImg(StatusImagesNames.URL_PRIORITY_LOW, task, StatusImagesNames.PREFIX_PRIORITY_LOW);
    taskDiv.appendChild(imgPriorityLow);
}

// Creates status images and adds them to a div-status-images div, we should show/hide them when task status changes
function createTaskStatusImagesWatch() {
    var imgOverdue = createTaskStatusImgWatch(StatusImagesNames.URL_OVERDUE, StatusImagesNames.PREFIX_OVERDUE);
    $('div-status-images').appendChild(imgOverdue);
    var imgAlarm = createTaskStatusImgWatch(StatusImagesNames.URL_ALARM, StatusImagesNames.PREFIX_ALARM);
    $('div-status-images').appendChild(imgAlarm);
    var imgRepeat = createTaskStatusImgWatch(StatusImagesNames.URL_REPEAT, StatusImagesNames.PREFIX_REPEAT);
    $('div-status-images').appendChild(imgRepeat);
    var imgPriorityHigh = createTaskStatusImgWatch(StatusImagesNames.URL_PRIORITY_HIGH, StatusImagesNames.PREFIX_PRIORITY_HIGH);
    $('div-status-images').appendChild(imgPriorityHigh);
    var imgPriorityLow = createTaskStatusImgWatch(StatusImagesNames.URL_PRIORITY_LOW, StatusImagesNames.PREFIX_PRIORITY_LOW);
    $('div-status-images').appendChild(imgPriorityLow);
}

// Creates a status img
// string url - the Image url
// task - the task which is connected to a task Div (to form the unique id)
// prefix - the prefix to an image id
// returns [object img] which should be added to some parent element
function createTaskStatusImg(url, task, prefix) {
    var img = document.createElement('img');
    img.setAttribute("id", prefix + task.id);
    img.src = url;
    img.width = 12;
    img.height = 12;
    img.style.display = 'none';
    return img;
}

// Creates a status img
// string url - the Image url
// task - the task which is connected to a task Div (to form the unique id)
// prefix - the prefix to an image id
// returns [object img] which should be added to some parent element
function createTaskStatusImgWatch(url, prefix) {
    var img = document.createElement('img');
    img.setAttribute("id", prefix + 'watch');
    img.src = url;
    img.width = 16;
    img.height = 16;
    img.style.display = 'none';
    return img;
}

// Creates a checkBox completed / needsAction for a task
// task - the task which is connected to a task Div
// returns [object checkBox] which should be added to some parent element
function createCheckBoxForTask(task) {
    var checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.setAttribute("id", MainSectionPrefixes.PREFIX_CB_COMPLETED + task.id);

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

        var m_taskId = targ.id.substring(MainSectionPrefixes.PREFIX_CB_COMPLETED.length);
        var taskListId = li? li.taskListId: '';
        task.status = targ.checked ? TaskStatuses.COMPLETED : TaskStatuses.NEEDS_ACTION;
        changeTaskStatusRequest(taskListId, m_taskId, targ.checked);
       // alert(task.title + " " + taskListId);
    });

    return checkBox;
}

/*
    Refreshes sub tasks div (removes old section and creates new section)
    object taskDiv - the parent section for a subTaskDiv
    task - a task which is connected to a task Div
*/
function refreshSubTasksSectionMain(taskDiv, task) {
    var notesSection = getNotesSection(task);
    var subTaskDiv = $(MainSectionPrefixes.PREFIX_DIV_SUBTASK + task.id);

    if (subTaskDiv) {
        subTaskDiv.parentNode.removeChild(subTaskDiv);
    }

    taskDiv.subTask = null;

    if (canBeConvertedToSubtasks( notesSection)) {
        var subTasks = convertToSubTasks(notesSection);
        createSubTasksDiv(taskDiv, task, subTasks, MainSectionPrefixes.PREFIX_DIV_SUBTASK, true);
        taskDiv.subTasks = subTasks;
    }
}

// </editor-fold>

//  <editor-fold desc="Setting elements states for a MAIN div">

// shows / hides images priority, repeat, alarm in MAIN section
// task - a task which is connected to a task div, to which images belong
function SetDisplayTaskStatusAddImages(task) {
    if (additionalSectionExist(task)) {
        var additionalSection = getAdditionalSection(task);
        $(StatusImagesNames.PREFIX_ALARM + task.id).style.display = isAlarmedTask(additionalSection) ? '': 'none';
        $(StatusImagesNames.PREFIX_REPEAT + task.id).style.display = isRepeatableTask(additionalSection) ? '': 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_HIGH + task.id).style.display = isHighPriorityTask(additionalSection) ? '': 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_LOW + task.id).style.display = isLowPriorityTask(additionalSection) ? '': 'none';
    }
}

// shows / hides overdue image in MAIN section
// task - a task which is connected to a task div, to which images belong
function SetDisplayStatusOverdue(task) {
    $(StatusImagesNames.PREFIX_OVERDUE + task.id).style.display = isOverdueTask(task) ? '': 'none';
}

// checks / unchecks task checkbox to show task.status
// task - a task which is connected to a task div, to which checkbox belongs
function SetTaskStatusCheckbox(task) {
    var checkBox = $(MainSectionPrefixes.PREFIX_CB_COMPLETED + task.id);

    if (checkBox.checked != (task.status == TaskStatuses.COMPLETED)) {
        checkBox.checked = (task.status == TaskStatuses.COMPLETED);
        setTimeout(function () { OnChangeTaskStatusCB(checkBox); }, 15);
    }
}

// sets a task Title for a task div
// task - a task which is connected to a task div
function SetTaskTitle(task) {
    var taskSpan = $(MainSectionPrefixes.PREFIX_SPAN_TITLE + task.id);
    taskSpan.innerText = task.title;
}

// sets a subTask Title
// string taskId - the id of a task to which subTask belongs
// int subTaskNum - the number of subtask from 0
// string text - the new Title
function SetSubTaskTitle(taskId, subTaskNum, text) {
    var subTaskSpan = $(MainSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum);
    subTaskSpan.innerText = text;
}

// </editor-fold>

//  <editor-fold desc="Setting elements states for a WATCH div">

// sets a subTask Title
// string taskId - the id of a task to which subTask belongs
// int subTaskNum - the number of subtask from 0
// string text - the new Title
function SetSubTaskTitleWatch(taskId, subTaskNum, text) {
    var subTaskSpan = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum);
    subTaskSpan.innerText = text;
}

// shows or hides Overdue image in Watch section
function SetDisplayStatusOverdueWatch() {
    var status = $('checkbox-task-completed').checked ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
    var date = null;
    if ($('checkbox-with-date').checked) {
        date = new MyDate();
        date.setFromInputValue( $('input-task-date').value);
        date = date.toJSON();
    }

    var task = date? {status: status, due: date}: {status: status};

    $(StatusImagesNames.PREFIX_OVERDUE + 'watch').style.display = isOverdueTask(task) ? '': 'none';
}

// shows or hides alarm, repeat, priority_high, priority_low images in Watch section
function SetDisplayTaskStatusAddImagesWatch() {
    var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : getSubTasksArrFromWatchDiv().join('\n');
    notes += getAdditionalSection($('watch').task);

    var task = {notes: notes};

    if (additionalSectionExist(task)) {
        var additionalSection = getAdditionalSection(task);
        $(StatusImagesNames.PREFIX_ALARM + 'watch').style.display = isAlarmedTask(additionalSection) ? '' : 'none';
        $(StatusImagesNames.PREFIX_REPEAT + 'watch').style.display = isRepeatableTask(additionalSection) ? '' : 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_HIGH + 'watch').style.display = isHighPriorityTask(additionalSection) ? '' : 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_LOW + 'watch').style.display = isLowPriorityTask(additionalSection) ? '' : 'none';
    }
    else {
        $(StatusImagesNames.PREFIX_ALARM + 'watch').style.display = 'none';
        $(StatusImagesNames.PREFIX_REPEAT + 'watch').style.display = 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_HIGH + 'watch').style.display = 'none';
        $(StatusImagesNames.PREFIX_PRIORITY_LOW + 'watch').style.display = 'none';
    }
}
//  </editor-fold>

// <editor-fold desc="Task Div event handlers for a MAIN div">

function OnTaskDivMouseOver(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    targ.style.background='gray';

    if (targ.task) {
        $(MainSectionPrefixes.PREFIX_ARROW_TITLE + targ.task.id).style.display = '';
    }
}

function OnTaskDivMouseOut(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    targ.style.background='white';

    if (targ.task) {
        $(MainSectionPrefixes.PREFIX_ARROW_TITLE + targ.task.id).style.display = 'none';
    }
}

function OnTaskDivClick(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    targ = targ.parentNode;

    if (targ.task && targ.taskListId) {
        // removing previous divSubWatch

        $('watch').task = targ.task;
        $('watch').taskListId = targ.taskListId;

        SetWatchFieldsFromTask($('watch').task);
        SetDisableWatchButtons(true);
        showOneSection('watch');
    }
}

function OnMoveToListClick(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;

    if (targ.taskListId) {
        if ($('watch').taskListId != targ.taskListId) {
            // try to move task to another task list
            deleteTaskRequest($('watch').taskListId, $('watch').task);
            var date = "";
            if ($('checkbox-with-date').checked) {
                date = new MyDate();
                date.setFromInputValue( $('input-task-date').value);
            }

            var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : getSubTasksArrFromWatchDiv().join('\n');
            notes += getAdditionalSection($('watch').task);
            insertTaskRequest(targ.taskListId, $('checkbox-task-completed').checked, $('input-task-name').value, date, notes);
            ActionBackToList();
        }
    }
}

// </editor-fold>

// <editor-fold desc="Common event handlers">
function OnChangeTaskStatusCB(targ) {
    var taskId = targ.id.substring(MainSectionPrefixes.PREFIX_CB_COMPLETED.length);
    var spanId = MainSectionPrefixes.PREFIX_SPAN_TITLE + taskId;

    document.getElementById(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
}

function OnChangeSubTaskStatusCB(targ) {
    var taskId = targ.id.substring('ch_'.length);
    var spanId = MainSectionPrefixes.PREFIX_SPAN_TITLE + taskId;

    var li = targ;
    while (li != null && li.taskListId == undefined) li = li.parentNode;


    document.getElementById(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
}

/*  No date checkbox event handler
 Hides input-task-date if checkbox not checked, shows otherwise */
function OnNoDateCheckChanged() {
    $('input-task-date').style.display = $('checkbox-with-date').checked ? '' : 'none';
}

// Update status images when some editing was done
function OnSomeEditDone() {
    SetDisplayStatusOverdueWatch();
    SetDisplayTaskStatusAddImagesWatch();
    SetDisableWatchButtons(false);
}

// </editor-fold>

// <editor-fold desc="Actions (add/remove) for a subTasks div in Watch div">

// Removes Sub Tasks div section from Watch section
function removeSubTasksDivFromWatch() {
    if ($('watch').task == undefined) {
        return;
    }

    var subTaskDiv = $(WatchSectionPrefixes.PREFIX_DIV_SUBTASK + $('watch').task.id);

    if (subTaskDiv) {
        subTaskDiv.parentNode.removeChild(subTaskDiv);
    }
}

// Adds Sub Tasks div section to Watch section
function addSubTasksDivToWatch(notesOrig) {
    var subTasks = convertToSubTasks(notesOrig);
    createSubTasksDiv($("div-notes"), $('watch').task , subTasks, WatchSectionPrefixes.PREFIX_DIV_SUBTASK, false);
    $('input-task-comment').style.display = 'none';
}

// </editor-fold>

// Make subTasks array from a sub Tasks Div
// Returns string[] subTasks - array of subTasks
function getSubTasksArrFromWatchDiv() {
    var subTasksDiv = $(WatchSectionPrefixes.PREFIX_DIV_SUBTASK + $('watch').task.id);

    var num = subTasksDiv.children.length;
    var subTasks = [];

    for (var i=0; i<num; i++) {
        var checkBox = $(WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + $('watch').task.id + "_" + i);
        var textNode = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + $('watch').task.id + "_" + i);

        var subTask = checkBox.checked ? '[x]':'[ ]';
        subTask = subTask + textNode.innerText;
        subTasks.push(subTask);
    }

    return subTasks;
}

// Adds a subTask span and a checkbox to a parent task
// object li - parent node (with task name)
// string subTask - a name of a subTask
// string taskId  - parent task`s id
// int subTaskNum - subtask`s number
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
        // alert("task = " + JSON.stringify(li.task));

        while (li != null && li.taskListId == undefined) li = li.parentNode;


        var taskListId = li? li.taskListId: '';
         // alert("taskListId = " + taskListId);
        var subTaskId = parseInt(targ.id.substring('ch_'.length).substring(m_taskId.length + 1));
        // alert("subTaskId = " + subTaskId);

        var arr = convertToSubTasks(oldNotes);
        arr[subTaskId] = (targ.checked ? 'T' : 'F') + arr[subTaskId].substring('T'.length);
        var newNotes = convertFromSubTasks(arr);
        // alert("newNotes = " + newNotes);
        task.notes = newNotes;
        changeSubTaskStatusRequest(taskListId, m_taskId, newNotes);
    });

    span.appendChild(checkBox);
    span.appendChild(createSimpleTextNode(text, MainSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum));
    li.appendChild(span);
    //SetSubTaskTitle(taskId, subTaskNum, text);

    if (isDone) {
        checkBox.checked = true;
        setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);
    }
}


// bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
// false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
// Draws subTasks for a task
// object li - parent node (with task name)
// string[] subTasks - array of subTasks
// string taskId - the Task id
// bool forMain - true, draw subTasks for main section ; false, draw subTasks for watch section
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

// <editor-fold desc="Convert text to subTasks and SubTasks To Text">
// Checks if the comment text can be converted to subTasks array
// string text - a text to check
// returns true if the conversion can be done
function canBeConvertedToSubtasks(text) {
    text = text.trim();
    var textCpy = text;
    var mas = textCpy.split('\n');

    for (var i = 0; i < mas.length; i++) {
        if (mas[i].indexOf('[ ]') != 0 && mas[i].indexOf('[x]') != 0) {
            return false;
        }
    }

    return true;
}

// returns a subTasks array from task notes (text)
// each line MUST start from [ ] or [x]
// returns string[] subTasks - array of subTasks
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

   return subTasksList;
}

// returns a subTasks array from a multiline text
// each line with any text becomes a task with a status = require action
// each line started with [x] becomes a task with a status = completed
// returns string[] subTasks - array of subTasks
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

    return subTasksList;
}

// Build a string (notes) from sub Tasks array
// string[] arr - array of subTasks
// Returns [string] notes
function convertFromSubTasks(arr) {
    var str = arr.join('\n^&^');
    str = str.split('^&^F').join('[ ]');
    str = str.split('^&^T').join('[x]');
    return str;
}

// </editor-fold>

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

// <editor-fold desc="Actions for a Watch section">
// Return to Main section from Watch section
function ActionBackToList() {
    removeSubTasksDivFromWatch();
    showOneSection('main');
}

// Save changes
function ActionSaveTask() {
    if ($('watch').task != undefined && $('watch').taskListId != undefined) {
        var task = $('watch').task;
        var taskListId = $('watch').taskListId;

        var date = "";
        if ($('checkbox-with-date').checked) {
            date = new MyDate();
            date.setFromInputValue( $('input-task-date').value);
        }

        var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : getSubTasksArrFromWatchDiv().join('\n');
        notes += getAdditionalSection($('watch').task);
        changeTaskRequest(taskListId, task, $('checkbox-task-completed').checked, $('input-task-name').value, date, notes);
    }
}

// Convert notes to subTaks
function ActionToSubtasks() {
    changeNotesState($('input-task-comment').style.display == '');
}

// Cancel changes = go back to server state
function ActionDiscard() {
    if ($('watch').task != undefined && $('watch').taskListId != undefined) {
       removeSubTasksDivFromWatch();
       SetDisableWatchButtons(true);
       SetWatchFieldsFromTask($('watch').task);
    }
}

function changeNotesState(showSubTasks) {
    if (showSubTasks) {
        // проанализировать содержимое поля комментария
        // кол-во строк там = кол-ву подзадач
        // если у подзадачи есть [x] - это значит выполненная подзадача
        // если есть [] - это удаляется из описания (пока не будем делать этого)
        var notesOrig = $('input-task-comment').value.trim();
        if (notesOrig == '') {
            return;
        }

        var subTasks = convertToSubTasksLight(notesOrig);

        createSubTasksDiv($("div-notes"), $('watch').task , subTasks, 'divsubwatch_', false);
        $('input-task-comment').style.display = 'none';
    }
    else {
        var subTasks = getSubTasksArrFromWatchDiv();
        for (var i=0; i < subTasks.length; i++) {
            if (subTasks[i].substring(0, 3) == '[ ]') {
                subTasks[i] = subTasks[i].substring(3);
            }
        }

        removeSubTasksDivFromWatch();
        $('input-task-comment').value = subTasks.join('\n');
        $('input-task-comment').style.display = '';
    }
}


function SetDisableWatchButtons(disable) {
    if (disable) {
        disableButton($('button-save_task'));
        disableButton($('button-discard'));
    }
    else {
        enableButton($('button-save_task'));
        enableButton($('button-discard'));
    }
}

function SetWatchFieldsFromTask(task) {
    var myDate = new MyDate();
    myDate.setStartNextHour();

    $('checkbox-task-completed').checked = task.status == TaskStatuses.COMPLETED;
    $('input-task-name').value = task.title;
    $('input-task-date').value = task.due != null ? new MyDate(new Date(task.due)).toInputValue() : myDate.toInputValue();
    var notesOrig = task.notes != undefined ? getNotesSection(task) : '';
    $('input-task-comment').value = notesOrig;
    $('input-task-comment').style.display = '';
    $('checkbox-with-date').checked = task.due != null;
    $('input-task-date').style.display = task.due != null ? '': 'none';

    // show subtasks and hide notes
    if (canBeConvertedToSubtasks(notesOrig)) {
        addSubTasksDivToWatch(notesOrig);
    }

    // tasklists

    while( $('taskListsWatch').children.length > 0){
        $('taskListsWatch').removeChild( $('taskListsWatch').children[0]);
    }

    for (var i = 0 ; i < $('listId').children.length; i++) {
        if ($('listId').children[i].taskList == undefined) {
           continue;
        }

        var taskList = $('listId').children[i].taskList;
        var li = document.createElement('li');
        li.addEventListener("click", OnMoveToListClick);
        var galka = $('watch').taskListId == taskList.id ? '\u2714' : '';
        li.appendChild(document.createTextNode(galka + ' ' + taskList.title));
        li.taskListId = taskList.id;
        $('taskListsWatch').appendChild(li);
    }

    OnSomeEditDone();
}

// </editor-fold>

// <editor-fold desc="Drawing in a Watch section">
function drawSubTaskWatch(li, subTask, taskId, subTaskNum) {
    var span = document.createElement('div');
    var isDone = subTask.substring(0,1) == 'T';
    var text = subTask.substring(1);
    var checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.setAttribute("id", WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + taskId + "_" + subTaskNum);
    checkBox.addEventListener('change', function(e) {
        var targ;

        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        OnChangeSubTaskStatusCB(targ);
    });

    span.appendChild(checkBox);
    span.appendChild(createSimpleTextNode(text, WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum));
    li.appendChild(span);
    // SetSubTaskTitleWatch(taskId, subTaskNum, text);

    if (isDone) {
        checkBox.checked = true;
        setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);
    }
}

// </editor-fold>

// <editor-fold desc="Change task requests">
function changeTaskStatusRequest(taskListId, taskId, isCompleted) {
    var status = isCompleted ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  isCompleted? '{"status":"' + status + '", "id": "'+ taskId + '"}' : '{"status":"' + status + '", "completed": null, "id": "' + taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus, "PUT");
}

function changeSubTaskStatusRequest(taskListId, taskId, notes) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
    var data =  '{"notes": "' + filterSpecialChar(notes) + '", "id": "'+ taskId + '"}';
    makePOSTRequest(url, data, OnChangeTaskStatus, "PUT");
}

function changeTaskRequest(taskListId, task, isCompleted, title, dueDate, notes) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + task.id + '?key=' + API_KEY;
    var data = '{"id": "'+ task.id + '"';
    var status = isCompleted ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
    var hasChanges = false;

    if (task.status != status) {
        data += isCompleted? ',"status":"' + status + '"' : ',"status":"' + status + '", "completed": null';
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
        makePOSTRequest(url, data, OnChangeTaskStatus, "PUT");
    }
}

function insertTaskRequest(taskListId, isCompleted, title, dueDate, notes) {
    // https://www.googleapis.com/tasks/v1/lists/' + listId + '/tasks
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks?key=' + API_KEY;
    var data = '{';
    var status = isCompleted ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
    data += isCompleted? '"status":"' + status + '"' : '"status":"' + status + '", "completed": null';
    title = filterSpecialChar(title);
    data +=  ',"title":"' + title + '"';
    notes = filterSpecialChar(notes);
    data += ',"notes":"' + notes + '"';

    if (dueDate) {
        dueDate = dueDate.toJSON();
        data += ',"due":"' + dueDate + '"';
    }

    data += '}';
    makePOSTRequest(url, data, OnTaskInserted, "POST");
}

function deleteTaskRequest(taskListId, task) {
    var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + task.id + '?key=' + API_KEY;
    var shell = TaskDeletedShell(task, taskListId);
    makePOSTRequest(url, '', shell.OnTaskDeleted, "DELETE");
}

// calback function for a change task request
function OnChangeTaskStatus(obj) {
    if (obj.errors.length > 0) {
        alert('Sorry! Some error occured! ' + JSON.stringify(obj.errors[0]));
        return;
    }

    // обновляем только секцию Main (что делать с секцией Watch пока не понятно)
    if (obj.text) {
        var taskFromServer = JSON.parse(obj.text);
        UpdateTask(taskFromServer);
    }
}

// calback function for a change task request
function  OnTaskInserted(obj) {
    if (obj.errors.length > 0) {
        alert('Sorry! Some error occured! ' + JSON.stringify(obj.errors[0]));
        return;
    }

    if (obj.text) {
        var taskFromServer = JSON.parse(obj.text);
        var taskListId = taskFromServer.selfLink.substring('https://www.googleapis.com/tasks/v1/lists/'.length);
        taskListId = taskListId.substring(0, taskListId.indexOf('/'));
        InsertTask(taskListId, taskFromServer, $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskListId));
    }
}

function OnTaskDeleted(obj) {
    if (obj.errors.length > 0) {
        alert('Sorry! Some error occured! ' + JSON.stringify(obj.errors[0]));
        return;
    }

    if (obj.text == '' && obj.rc == 204) {
        // deleted successfully
    }
}

function TaskDeletedShell(taskToDelete, taskListId) {
    var task = taskToDelete;
    return {
        OnTaskDeleted: function(obj) {
            if (obj.errors.length > 0) {
                alert('Sorry! Some error occured! ' + JSON.stringify(obj.errors[0]));
                return;
            }

            if (obj.text == '' && obj.rc == 204) {
                DeleteTask(task, taskListId);
            }
        }
    };

}

function UpdateTask(taskFromServer) {
    if (taskFromServer) {

        SetTaskStatusCheckbox(taskFromServer);
        SetTaskTitle(taskFromServer);

        var taskDiv = $(MainSectionPrefixes.PREFIX_DIV_TASK + taskFromServer.id);

        SetDisplayStatusOverdue(taskFromServer);

        if (taskFromServer.notes != taskDiv.task.notes) {

            SetDisplayTaskStatusAddImages(taskFromServer);
            refreshSubTasksSectionMain(taskDiv, taskFromServer);
        }

        taskDiv.task = taskFromServer;
    }
}

function InsertTask(taskListId, taskFromServer, ul) {
    var liChild = document.createElement('li');
    liChild.setAttribute("id", MainSectionPrefixes.PREFIX_LI_TASK + taskFromServer.id);
    var taskDiv = createTaskDiv(taskFromServer, taskListId);

    var span = createSimpleTextNode(taskFromServer.title, MainSectionPrefixes.PREFIX_SPAN_TITLE + taskFromServer.id);
    var checkBox = createCheckBoxForTask(taskFromServer);
    taskDiv.appendChild(checkBox);
    createTaskStatusImages(taskDiv, taskFromServer);
    taskDiv.appendChild(span);
    var arrow = createSimpleTextNode('\u25B6', MainSectionPrefixes.PREFIX_ARROW_TITLE + taskFromServer.id);
    taskDiv.appendChild(arrow);
    liChild.appendChild(taskDiv);
    arrow.style.float = 'right';
    arrow.style.display = 'inline-block';
    arrow.style.margin = '0px';
    arrow.style.cursor = 'pointer';
    arrow.style.display = 'none';
    arrow.addEventListener("click", OnTaskDivClick);
    // TODO change it to langs
    arrow.title = 'Edit details';

    refreshSubTasksSectionMain(taskDiv, taskFromServer);
    ul.appendChild(liChild);
    $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskListId).style.display = 'none';

    // set task statuses
    SetDisplayTaskStatusAddImages(taskFromServer);
    SetDisplayStatusOverdue(taskFromServer);
    SetTaskStatusCheckbox(taskFromServer);
    SetTaskTitle(taskFromServer);
}

function DeleteTask(taskFromServer, taskListId) {
    var taskLi = $(MainSectionPrefixes.PREFIX_LI_TASK + taskFromServer.id);
    if (taskLi) {
        taskLi.parentNode.removeChild(taskLi);
    }

    var taskListUl = $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskListId);
    console.log("Удалили. Осталось тасков в списке: " + taskListUl.childNodes.length);

    for(var k=0; k < taskListUl.childNodes.length; k++) {
        var child = taskListUl.childNodes[k];
        console.log(k + ' ' + child.type + ' ' + child.id);
    }


    if (taskListUl.childNodes.length == 1) {
        // no tasks any more, we should show <no tasks> section
        $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskListId).style.display = '';
    }
}


// </editor-fold>

// <editor-fold desc="Utils">
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

// </editor-fold>

function additionalSectionExist(task) {
    var text = task.notes;

    if (text == undefined) {
        return false;
    }

    return (text.indexOf('\n<!=\n') >= 0 && text.indexOf('\n=!>') > text.indexOf('\n<!=\n'));
}

function getAdditionalSection(task) {
    if (!additionalSectionExist(task)) {
        return '';
    }

    var text = task.notes;
    var index = text.indexOf('\n<!=\n');
    return text.substring(index);
}

function getNotesSection(task) {
    if (task.notes == undefined) {
        return '';
    }

    if (!additionalSectionExist(task)) {
        return task.notes;
    }

    var text = task.notes;
    var index = text.indexOf('\n<!=\n');
    return text.substring(0, index);
}

function isLowPriorityTask(additionalSection) {
    return additionalSection.indexOf('PRIORITY:-1') > 0;
}

function isHighPriorityTask(additionalSection) {
    return additionalSection.indexOf('PRIORITY:1') > 0;
}

function isRepeatableTask(additionalSection) {
    return additionalSection.indexOf('DTSTART:') > 0 && additionalSection.indexOf('RRULE:') > 0;
}

function isAlarmedTask(additionalSection) {
    return additionalSection.indexOf('REMINDER:') > 0;
}

function isOverdueTask(task) {
    if (task.due && task.status == TaskStatuses.NEEDS_ACTION) {
        var today = new Date();
        var due = new Date(task.due);

        if (today - due > 0) {
            return true;
        }
    }

    return false;
}

/* make button disabled
 Button (getElementById) button*/
function disableButton(button) {
    button.setAttribute('disabled', 'disabled');
}

/* make button enabled
 Button (getElementById) button*/
function enableButton(button) {
    button.removeAttribute('disabled');
}








