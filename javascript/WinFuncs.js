var makePOSTRequest = null;
var baseUrlImg = 'https://raw.githubusercontent.com/Appiens/daybyday_gadget/master/images/';
var API_KEY = 'AIzaSyCuKllVMlv0ENk8Skg8_-IKM1Cs9GeL-NU';//'AIzaSyD60UyJs1CDmGQvog5uBQX1-kARqhU7fkk';
var isDrawingMainList = false;
var taskListsLast = []; // последний полученный список таскЛистов
var taskNodeController = new TaskNodeController();
var taskListNodeController = new TaskListNodeController();
var subTaskDivMainController = new SubTaskDivMainController();
var subTaskDivWatchController = new  SubTaskDivWatchController();
var requestController = new RequestController();
var watchSectionController = new WatchSectionController();

// структура дерева (находящиеся на одном отступе элементы являются сиблингами, с бОльшим отступом - чайлдами)
//   <ul id="listId">
//      <li id= "litl_" + taskListId> (содержит ссылку taskListId, taskList) Название списка задач
//          <span id="tl_" + taskListId>Название списка задач
//          <ul id = "ul_" + taskListId> (список задач)
//              <li id= "emp_" + taskListId> (есть есть другие li в списке - секция скрыта, иначе отображена)
//                  <span> <no tasks> </span>
//              <li id="li_" + taskId> (именно его нужно удалить при удалении таска)
//                  <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId) ===> Нажатие на DIV вызывает окно редактирования таска
//                      <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox> ===> Нажатие на CHECKBOX объявляет задачу выполненной/невыполненной (отправляет запрос PUT status)
//                      <img id = "img_alm_" + taskId> // признак напоминания скрыт если нет напоминания, отображён - если есть
//                      <img id = "img_rpt_" + taskId> // признак повторяющейся задачи скрыт если нет, отображён если есть
//                      <img id = "img_ovr_" + taskId> // признак просроченной задачи скрыт если нет, отображён если есть
//                      <img id = "img_phi_" + taskId> // признак высокого приоритета - скрыт если нет, отображён если есть
//                      <img id = "img_plo_" + taskId> // признак низкого приоритета - скрыт если нет, отображён если есть
//                      <span id = "t_" + taskId> Название задачи </span>
//                      <span id = "ar_" + taskId> Стрелочка для редактирования задачи</span> // отображается при наведении курсора
//                      <div id = "divsub_" + taskId> (содержит подзадачи)
//                          <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div> ===> Нажатие на CHECKBOX объявляет подзадачу выполненной/невыполненной (отправляет запрос PUT notes)
//                          ...
//                          <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//              ...
//              <li id="li_" + taskId> (именно его нужно удалить при удалении таска)
//                  <div id = "div_" + taskId> (содержит ссылки task и subTask и taskListId)
//                      <checkbox id= "ch_" + taskId> (выполенена задача или нет) </checkbox>
//                      <img id = "img_alm_" + taskId> // признак напоминания скрыт если нет напоминания, отображён - если есть
//                      <img id = "img_rpt_" + taskId> // признак повторяющейся задачи скрыт если нет, отображён если есть
//                      <img id = "img_ovr_" + taskId> // признак просроченной задачи скрыт если нет, отображён если есть
//                      <img id = "img_phi_" + taskId> // признак высокого приоритета - скрыт если нет, отображён если есть
//                      <img id = "img_plo_" + taskId> // признак низкого приоритета - скрыт если нет, отображён если есть
//                      <span id = "t_" + taskId> Название задачи </span>
//                      <span id = "ar_" + taskId> Стрелочка для редактирования задачи</span> // отображается при наведении курсора
//                      <div id = "divsub_" + taskId> (содержит подзадачи)
//                          <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>
//                          ...
//                          <div><checkbox id= "ch_" + taskId + "_" + subTaskNum></checkbox><span> Название подзадачи</span></div>

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
//      <textarea name="input-task-comment" id="input-task-comment" rows="5" placeholder="__MSG_notes_default__"></textarea>
//      <div id = "divsubwatch_" + taskId> (содержит подзадачи)
//          <div>
//              <checkbox id= "ch_w_" + taskId + "_" + subTaskNum></checkbox>
//              <editbox id="t_w_" + taskId + "_" + subTaskNum > Название подзадачи</editbox>
//              <a id = "a_w_" + taskId + "_" + subTaskNum>X</a> // удаление сабтаска
//              <a id= "a_wa_" + taskId + "_" + subTaskNum>Plus</a> // добавление сабтаска (виден только последний)
//          </div>
//          ...
//          <div>
//              <checkbox id= "ch_w_" + taskId + "_" + subTaskNum></checkbox>
//              <editbox id="t_w_" + taskId + "_" + subTaskNum > Название подзадачи</editbox>
//              <a id = "a_w_" + taskId + "_" + subTaskNum>X</a> // удаление сабтаска
//              <a id= "a_wa_" + taskId + "_" + subTaskNum>Plus</a> // добавление сабтаска
//          </div>
//      </div> // div sub
// </div>

function init(makePostRequestFunc) {
    makePOSTRequest = makePostRequestFunc;

    $('checkbox-with-date').addEventListener('change', watchSectionController.OnNoDateCheckChanged);
    $('button-back-to-list').addEventListener('click', Actions.ActionBackToList);
    $('button-save_task').addEventListener('click', Actions.ActionSaveTask);
    $('button-to-subtasks').addEventListener('click', Actions.ActionToSubtasks);
    $('button-discard').addEventListener('click', Actions.ActionDiscard);
    $('button-insert-task').addEventListener('click', Actions.ActionInsertTask);
    $('button-delete-task').addEventListener('click', Actions.ActionDeleteTask);
    $('button-modify-task').addEventListener('click', Actions.ActionModifyTask);

    watchSectionController.createTaskStatusImagesWatch();

    $('checkbox-task-completed').addEventListener('change', watchSectionController.OnSomeEditDone);
    $('input-task-name').addEventListener('keyup', watchSectionController.OnSomeEditDone);
    $('checkbox-with-date').addEventListener('change', watchSectionController.OnSomeEditDone);
    $('input-task-date').addEventListener('change', watchSectionController.OnSomeEditDone);
    $('input-task-comment').addEventListener('keyup', watchSectionController.OnSomeEditDone);
    $('checkbox-with-date').addEventListener('change', watchSectionController.OnSomeEditDone);

    $('a-move-to-list').innerText = getLangValue('action_move_to_list') + ' ' + UnicodeSymbols.ARROW_DOWN;
}

/*generates the tasks tree in a main section*/
function generateList(taskLists) {
    var i;

    isDrawingMainList = true;
    var ulMain = document.getElementById('listId');

    // fill the list
    for (i = 0; i < taskLists.length; ++i) {
        taskListNodeController.InsertTaskListNode(taskLists[i], ulMain);
        taskListNodeController.InsertTasksNodesForTaskList(taskLists[i], $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskLists[i].id));
    } // for i

    isDrawingMainList = false;
    taskListsLast = taskLists;

    disableButton($('button-insert-task'));
    disableButton($('button-delete-task'));
    disableButton($('button-modify-task'));

    return ulMain;
}

/* Updates a task list from taskListsTmp asked from server, in this list we get tasks which were created/updated/deleted during last 5 mins*/
/* Применение изменений, полученных с сервера, к отображаемому списку ul*/
/*array[] taskLists - список списков задач, полученный с сервера*/
function processTmpList(taskLists) {
    var i;
    var isNewTaskList; // признак нового таск листа

    for (i = 0; i < taskLists.length; ++i) {
        // main list is refreshing, we MUST stop the updating process
        if (isDrawingMainList) {
            return;
        }

        isNewTaskList = false;

        var taskListUl = $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskLists[i].id);
        if (taskListUl) {
            // таск лист был переименован (возможно)
            taskListNodeController.SetTaskListTitle(taskLists[i]);
        }
        else {
            // таск лист был вставлен
            taskListNodeController.InsertTaskListNode(taskLists[i], $('listId'));
            isNewTaskList = true;
        }

        if (taskLists[i].tasks && taskLists[i].tasks.length > 0) {
            for (var j = 0; j < taskLists[i].tasks.length; j++) {

                // main list is refreshing, we MUST stop the updating process
                if (isDrawingMainList) {
                    return;
                }

                // если получаем таск, который редактируется в данный момент, выбрасываем пользователя в секцию Main, если были в секции Watch
                if ($('watch').style.display != 'none' && $('watch').task && $('watch').task.id == taskLists[i].tasks[j].id) {
                    Actions.ActionBackToList();
                }

                if (taskLists[i].tasks[j].deleted) {
                    try {
                        taskNodeController.DeleteTaskNode(taskLists[i].tasks[j], taskLists[i].id);
                    }
                    catch (e) {
                        console.log("Error deleting task " + taskLists[i].tasks[j].id + ' ' + e);
                    }

                    continue;
                }

                try {
                   if ($(MainSectionPrefixes.PREFIX_DIV_TASK + taskLists[i].tasks[j].id)) {
                       taskNodeController.UpdateTaskNode(taskLists[i].tasks[j]);
                   }
                   else {
                       taskNodeController.InsertTaskNode(taskLists[i].id, taskLists[i].tasks[j], $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskLists[i].id), true);
                   }

                }
                catch (e) {
                   console.log("Error inserting/updating task " + taskLists[i].tasks[j].id + ' ' + e);
                }
            } // for j
        }

        if (isNewTaskList) {
            // применяем метод только к вновь созданному узлу, а не к существующим
            CollapsibleLists.applyToChild($('listId'), $(MainSectionPrefixes.PREFIX_LI_TASKLIST + taskLists[i].id));
        }
    } // for i

    taskListNodeController.DeleteTaskListNodesNotExist(taskLists, taskListsLast);
    taskListsLast = taskLists;
}


// <editor-fold desc="Utils">
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
    var sections = [ 'main', 'approval', 'waiting', 'watch', 'error' ];

    for (var i=0; i < sections.length; ++i) {
        var s = sections[i];
        var el = document.getElementById(s);
        if (s === toshow) {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    }

    $('footer').style.display = toshow == 'main'? "": "none";
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

function IsButtonDisabled(button) {
    return button.hasAttribute('disabled');
}

function getLangValue(message) {
    var prefs = new gadgets.Prefs();
    return prefs.getMsg(message);
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

// </editor-fold>

var Actions = ( function() {
    return {
        // <editor-fold desc="Actions for a Watch section">
        // Return to Main section from Watch section
        ActionBackToList: function() {
                            subTaskDivWatchController.DeleteSubTasksDiv();
                            showOneSection('main');
                          },

        // Save changes
        ActionSaveTask: function() {
                            if ($('watch').task != undefined && $('watch').taskListId != undefined)
                            {
                                var task = $('watch').task;
                                var taskListId = $('watch').taskListId;

                                var date = "";
                                if ($('checkbox-with-date').checked) {
                                    date = new MyDate();
                                    date.setFromInputValue( $('input-task-date').value);
                                }

                                var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : subTaskDivWatchController.getSubTasksArrFromWatchDiv().join('\n');
                                notes += TaskUtils.getAdditionalSection($('watch').task);
                                requestController.changeTaskRequest(taskListId, task, $('checkbox-task-completed').checked, $('input-task-name').value, date, notes);
                             }
                          },

        // Convert notes to subTaks
        ActionToSubtasks:  function () {
                                watchSectionController.changeNotesState($('input-task-comment').style.display == '');
                                watchSectionController.OnSomeEditDone();
                            },

        // Cancel changes = go back to server state
        ActionDiscard: function () {
                                if ($('watch').task != undefined && $('watch').taskListId != undefined)
                                {
                                    subTaskDivWatchController.DeleteSubTasksDiv();
                                    watchSectionController.SetDisableWatchButtons(true);
                                    watchSectionController.SetWatchFieldsFromTask($('watch').task);
                                }
                        },

        ActionInsertTask: function() {
                                if (taskNodeController.selectedTaskDiv == null) {
                                    return;
                                }

                                var taskListId;

                                if (taskNodeController.selectedTaskDiv.taskListId == null) {
                                    var noTaskLi = taskNodeController.selectedTaskDiv;
                                    taskListId =  noTaskLi.id.substring(MainSectionPrefixes.PREFIX_LI_NO_TASKS.length);
                                }
                                else {
                                    taskListId = taskNodeController.selectedTaskDiv.taskListId;
                                }

                                requestController.insertTaskRequest(taskListId, false, '<untitled>', null, '', true, true);
                        },

        ActionDeleteTask: function() {
                                if (taskNodeController.selectedTaskDiv == null) {
                                    return;
                                }

                                if (taskNodeController.selectedTaskDiv.task == null ||
                                    taskNodeController.selectedTaskDiv.taskListId == null) {
                                    return;
                                }

                                var task = taskNodeController.selectedTaskDiv.task;
                                var taskListId = taskNodeController.selectedTaskDiv.taskListId;

                                requestController.deleteTaskRequest(taskListId, task);
                        },

        ActionModifyTask: function() {
                                if (taskNodeController.selectedTaskDiv == null) {
                                    return;
                                }

                                if (taskNodeController.selectedTaskDiv.task == null ||
                                    taskNodeController.selectedTaskDiv.taskListId == null) {
                                    return;
                                }

                                taskNodeController.EditTask(taskNodeController.selectedTaskDiv);
                        }
    };})();

var TaskUtils = (function() {
    return {
        isLowPriorityTask: function(additionalSection) {
                                return additionalSection.indexOf('PRIORITY:-1') > 0;
                            },

        isHighPriorityTask: function(additionalSection) {
                                return additionalSection.indexOf('PRIORITY:1') > 0;
                            },

        isRepeatableTask: function(additionalSection) {
                                return additionalSection.indexOf('DTSTART:') > 0 && additionalSection.indexOf('RRULE:') > 0;
                            },

        isAlarmedTask: function(additionalSection) {
                                return additionalSection.indexOf('REMINDER:') > 0;
                            },

        isOverdueTask: function(task) {
                                if (task.due && task.status == TaskStatuses.NEEDS_ACTION) {
                                    var today = new Date();
                                    var due = new Date(task.due);

                                    if (today - due > 0) {
                                        return true;
                                    }
                                }

                                return false;
                            },

        additionalSectionExist: function (task) {
                                           var text = task.notes;
                                           if (text == undefined) {
                                                return false;
                                            }

                                           return (text.indexOf('\n<!=\n') >= 0 && text.indexOf('\n=!>') > text.indexOf('\n<!=\n'));
                                },

        getAdditionalSection: function (task) {
                                        if (!TaskUtils.additionalSectionExist(task)) {
                                            return '';
                                        }

                                        var text = task.notes;
                                        var index = text.indexOf('\n<!=\n');
                                        return text.substring(index);
                                },

        getNotesSection: function(task) {
                                        if (task.notes == undefined) {
                                            return '';
                                        }

                                        if (!TaskUtils.additionalSectionExist(task)) {
                                            return task.notes;
                                        }

                                        var text = task.notes;
                                        var index = text.indexOf('\n<!=\n');
                                        return text.substring(0, index);
                                }
    };})();

function WatchSectionController() {
    var parent = this;

    // показать секцию notes / скрыть секцию с сабтасками (для Watch) и наоборот
    // bool showSubTasks - показать секцию с сабтасками
    this.changeNotesState = function(showSubTasks) {
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

            subTaskDivWatchController.InsertSubTaskDiv($("div-notes"), $('watch').task , subTasks);
            $('input-task-comment').style.display = 'none';
        }
        else {
            var subTasks = subTaskDivWatchController.getSubTasksArrFromWatchDiv();
            for (var i=0; i < subTasks.length; i++) {
                var len = SubTaskStatuses.COMPLETED_NOTES.length;
                if (subTasks[i].substring(0, len) == SubTaskStatuses.NEEDS_ACTION_NOTES) {
                    subTasks[i] = subTasks[i].substring(len);
                }
            }

            subTaskDivWatchController.DeleteSubTasksDiv();
            $('input-task-comment').value = subTasks.join('\n');
            $('input-task-comment').style.display = '';
        }
    }

    // fills watch section edit fields with info about a task
    // object task - a task to view in a watch section
    this.SetWatchFieldsFromTask = function(task) {
        var myDate = new MyDate();
        myDate.setStartNextHour();

        $('checkbox-task-completed').checked = task.status == TaskStatuses.COMPLETED;
        $('input-task-name').value = task.title;
        $('input-task-date').value = task.due != null ? new MyDate(new Date(task.due)).toInputValue() : myDate.toInputValue();
        var notesOrig = task.notes != undefined ? TaskUtils.getNotesSection(task) : '';
        $('input-task-comment').value = notesOrig;
        $('input-task-comment').style.display = '';
        $('checkbox-with-date').checked = task.due != null;
        $('input-task-date').style.display = task.due != null ? '': 'none';

        // show subtasks and hide notes
        if (parent.canBeConvertedToSubtasks(notesOrig)) {
            var subTasks = parent.convertToSubTasks(notesOrig);
            subTaskDivWatchController.InsertSubTaskDiv($("div-notes"), $('watch').task , subTasks);
            $('input-task-comment').style.display = 'none';
        }

        createMoveToListMenu();
        watchSectionController.OnSomeEditDone();
    }

    // <editor-fold desc="Convert text to subTasks and SubTasks To Text">
    // Checks if the comment text can be converted to subTasks array
    // string text - a text to check
    // returns true if the conversion can be done
    this.canBeConvertedToSubtasks = function(text) {
        text = text.trim();
        var textCpy = text;
        var mas = textCpy.split('\n');

        for (var i = 0; i < mas.length; i++) {
            if (mas[i].indexOf(/*'[ ]'*/ SubTaskStatuses.NEEDS_ACTION_NOTES) != 0 && mas[i].indexOf(/*'[x]'*/ SubTaskStatuses.COMPLETED_NOTES) != 0) {
                return false;
            }
        }

        return true;
    }

    // returns a subTasks array from task notes (text)
    // each line MUST start from [ ] or [x]
    // returns string[] subTasks - array of subTasks
    this.convertToSubTasks = function(text) {
        if (!parent.canBeConvertedToSubtasks(text)) {
            return null;
        }
        var textCpy = text;
        var mas = textCpy.split('\n');
        var subTasksList = [];
        var tmp;
        var len = SubTaskStatuses.COMPLETED_NOTES.length;

        for (var i=0; i < mas.length; i++) {
            tmp = mas[i].trim();
            if (tmp.substring(0, len) == SubTaskStatuses.NEEDS_ACTION_NOTES /*'[ ]'*/) {
                tmp = /*'F'*/ SubTaskStatuses.NEEDS_ACTION_LIST + tmp.substring(len);
            }
            else if (tmp.substring(0, len) == SubTaskStatuses.COMPLETED_NOTES /*'[x]'*/) {
                tmp = /*'T'*/ SubTaskStatuses.COMPLETED_LIST + tmp.substring(len);
            }

            subTasksList.push(tmp);
        }

        return subTasksList;
    }

    // Build a string (notes) from sub Tasks array
    // string[] arr - array of subTasks
    // Returns [string] notes
    this.convertFromSubTasks = function(arr) {
        var str = arr.join('\n^&^');
        str = '^&^' + str;

        str = str.split('^&^' + SubTaskStatuses.NEEDS_ACTION_LIST).join(SubTaskStatuses.NEEDS_ACTION_NOTES);
        str = str.split('^&^' + SubTaskStatuses.COMPLETED_LIST).join(SubTaskStatuses.COMPLETED_NOTES);
        return str;
    }

    /*  No date checkbox event handler
     Hides input-task-date if checkbox not checked, shows otherwise */
    this.OnNoDateCheckChanged = function() {
        $('input-task-date').style.display = $('checkbox-with-date').checked ? '' : 'none';
    }

    // Update status images when some editing was done
    this.OnSomeEditDone = function() {
        SetDisplayStatusOverdueWatch();
        SetDisplayTaskStatusAddImagesWatch();

        var checkBox = $('checkbox-task-completed');
        checkBox.disabled = $(StatusImagesNames.PREFIX_REPEAT + 'watch').style.display == '';

        if (checkBox.disabled) {
            checkBox.title = 'If task is repeatable, we can`t change its status! Please use Day by Day for this purpose!';
        }

        parent.SetDisableWatchButtons(false);
    }

    // заблокировать / разблокировать кнопки сохранения таска и отмены изменений
    // bool disable - заблокировать кнопки
    this.SetDisableWatchButtons = function(disable) {
        if (disable) {
            disableButton($('button-save_task'));
            disableButton($('button-discard'));
        }
        else {
            enableButton($('button-save_task'));
            enableButton($('button-discard'));
        }
    }

    // Creates status images and adds them to a div-status-images div, we should show/hide them when task status changes
    this.createTaskStatusImagesWatch = function() {
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

    // returns a subTasks array from a multiline text
    // each line with any text becomes a task with a status = require action
    // each line started with [x] becomes a task with a status = completed
    // returns string[] subTasks - array of subTasks
    var convertToSubTasksLight = function(text) {

        var textCpy = text;
        var mas = textCpy.split('\n');
        var subTasksList = [];
        var tmp;
        var len = SubTaskStatuses.COMPLETED_NOTES.length;

        for (var i=0; i < mas.length; i++) {
            tmp = mas[i].trim();

            console.log(tmp.substring(0, len) + ' ' + SubTaskStatuses.NEEDS_ACTION_NOTES);
            if (tmp.substring(0, len) == /*'[ ]'*/ SubTaskStatuses.NEEDS_ACTION_NOTES) {
                tmp = /*'F'*/ SubTaskStatuses.NEEDS_ACTION_LIST + tmp.substring(len);
            }
            else
            if (tmp.substring(0, len) == /*'[x]'*/ SubTaskStatuses.COMPLETED_NOTES) {
                tmp = /*'T'*/ SubTaskStatuses.COMPLETED_LIST + tmp.substring(len);
            }
            else {
                tmp = /*'F'*/ SubTaskStatuses.NEEDS_ACTION_LIST + tmp;
            }



            subTasksList.push(tmp);
        }

        return subTasksList;
    }

    // creates a menu with task lists
    var createMoveToListMenu = function() {
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
            var galka = $('watch').taskListId == taskList.id ? UnicodeSymbols.GALKA : '';
            li.appendChild(document.createTextNode(galka + ' ' + taskList.title));
            li.taskListId = taskList.id;
            $('taskListsWatch').appendChild(li);
        }
    }

    var OnMoveToListClick = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;

        if (!IsButtonDisabled($('button-save_task'))) {
            alert(getLangValue("msg_move_forbidden"));
            return;
        }

        if (targ.taskListId) {
            if ($('watch').taskListId != targ.taskListId) {
                // try to move task to another task list
                requestController.deleteTaskRequest($('watch').taskListId, $('watch').task);
                var date = "";
                if ($('checkbox-with-date').checked) {
                    date = new MyDate();
                    date.setFromInputValue( $('input-task-date').value);
                }

                var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : subTaskDivWatchController.getSubTasksArrFromWatchDiv().join('\n');
                notes += TaskUtils.getAdditionalSection($('watch').task);
                requestController.insertTaskRequest(targ.taskListId, $('checkbox-task-completed').checked, $('input-task-name').value, date, notes, true, true);
                Actions.ActionBackToList();
            }
        }
    }

    // Creates a status img
    // string url - the Image url
    // task - the task which is connected to a task Div (to form the unique id)
    // prefix - the prefix to an image id
    // returns [object img] which should be added to some parent element
    var createTaskStatusImgWatch = function(url, prefix) {
        var img = document.createElement('img');
        img.setAttribute("id", prefix + 'watch');
        img.src = url;
        img.width = 16;
        img.height = 16;
        img.style.display = 'none';
        return img;
    }

    // shows or hides alarm, repeat, priority_high, priority_low images in Watch section
    var SetDisplayTaskStatusAddImagesWatch = function() {
        var notes =  $('input-task-comment').style.display == '' ? $('input-task-comment').value : subTaskDivWatchController.getSubTasksArrFromWatchDiv().join('\n');
        notes += TaskUtils.getAdditionalSection($('watch').task);

        var task = {notes: notes};

        if (TaskUtils.additionalSectionExist(task)) {
            var additionalSection = TaskUtils.getAdditionalSection(task);
            $(StatusImagesNames.PREFIX_ALARM + 'watch').style.display = TaskUtils.isAlarmedTask(additionalSection) ? '' : 'none';
            $(StatusImagesNames.PREFIX_REPEAT + 'watch').style.display = TaskUtils.isRepeatableTask(additionalSection) ? '' : 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_HIGH + 'watch').style.display = TaskUtils.isHighPriorityTask(additionalSection) ? '' : 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_LOW + 'watch').style.display = TaskUtils.isLowPriorityTask(additionalSection) ? '' : 'none';
        }
        else {
            $(StatusImagesNames.PREFIX_ALARM + 'watch').style.display = 'none';
            $(StatusImagesNames.PREFIX_REPEAT + 'watch').style.display = 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_HIGH + 'watch').style.display = 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_LOW + 'watch').style.display = 'none';
        }
    }

    var SetDisplayStatusOverdueWatch = function() {
        var status = $('checkbox-task-completed').checked ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
        var date = null;
        if ($('checkbox-with-date').checked) {
            date = new MyDate();
            date.setFromInputValue( $('input-task-date').value);
            date = date.toJSON();
        }

        var task = date? {status: status, due: date}: {status: status};

        $(StatusImagesNames.PREFIX_OVERDUE + 'watch').style.display = TaskUtils.isOverdueTask(task) ? '': 'none';
    }
}

function RequestController() {
    this.changeTaskStatusRequest = function(taskListId, taskId, isCompleted) {
        var status = isCompleted ? TaskStatuses.COMPLETED: TaskStatuses.NEEDS_ACTION;
        var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
        var data =  isCompleted? '{"status":"' + status + '", "id": "'+ taskId + '"}' : '{"status":"' + status + '", "completed": null, "id": "' + taskId + '"}';
        makePOSTRequest(url, data, OnChangeTaskStatus, "PUT");
    }

    this.changeSubTaskStatusRequest = function(taskListId, taskId, notes) {
        var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + taskId + '?key=' + API_KEY;
        var data =  '{"notes": "' + filterSpecialChar(notes) + '", "id": "'+ taskId + '"}';
        makePOSTRequest(url, data, OnChangeTaskStatus, "PUT");
    }

    this.changeTaskRequest = function(taskListId, task, isCompleted, title, dueDate, notes) {
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

    this.insertTaskRequest = function(taskListId, isCompleted, title, dueDate, notes, gotoTask, selectTask) {
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

        var shell = TaskInsertedShell(gotoTask, selectTask);
        makePOSTRequest(url, data, shell.OnTaskInserted, "POST");
    }

    this.deleteTaskRequest = function(taskListId, task) {
        var url =  'https://www.googleapis.com/tasks/v1/lists/' + taskListId + '/tasks/' + task.id + '?key=' + API_KEY;
        var shell = TaskDeletedShell(task, taskListId);
        makePOSTRequest(url, '', shell.OnTaskDeleted, "DELETE");
    }

    // calback function for a change task request
    var OnChangeTaskStatus = function(obj) {
        if (obj.errors.length > 0) {
            alert(getLangValue("msg_error_occured")+ '\n' + JSON.stringify(obj.errors[0]));
            return;
        }


        if (obj.text) {
            console.log(obj.text);
            var taskFromServer = JSON.parse(obj.text);

            // обновляем секцию Main
            taskNodeController.UpdateTaskNode(taskFromServer);

            // если получаем таск, который редактируется в данный момент, обновляем привязки в секции Watch
            if ($('watch').style.display != 'none' && $('watch').task && $('watch').task.id == taskFromServer.id) {
                $('watch').task = taskFromServer;
                watchSectionController.SetDisableWatchButtons(true);
            }
        }
    }

// обертка для обработчика события удаления таска
    var TaskDeletedShell = function(taskToDelete, taskListId) {
        var task = taskToDelete;
        return {
            OnTaskDeleted: function(obj) {
                if (obj.errors.length > 0) {
                    alert(getLangValue("msg_error_occured") + '\n' + JSON.stringify(obj.errors[0]));
                    return;
                }

                if (obj.text == '' && obj.rc == 204) {
                    taskNodeController.DeleteTaskNode(task, taskListId);
                }
            }
        };
    }

    var TaskInsertedShell = function(gotoTask, selectTask) {
        return {
            OnTaskInserted : function(obj) {
                if (obj.errors.length > 0) {
                    alert(getLangValue("msg_error_occured") + '\n' + JSON.stringify(obj.errors[0]));
                    return;
                }

                if (obj.text) {
                    var taskFromServer = JSON.parse(obj.text);
                    var taskListId = taskFromServer.selfLink.substring('https://www.googleapis.com/tasks/v1/lists/'.length);
                    taskListId = taskListId.substring(0, taskListId.indexOf('/'));
                    taskNodeController.InsertTaskNode(taskListId, taskFromServer, $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskListId), true);

                    if (gotoTask) {
                        var taskDiv = $(MainSectionPrefixes.PREFIX_DIV_TASK + taskFromServer.id);
                        $('main').scrollTop = getOffset(taskDiv);
                    }

                    if (selectTask) {
                        taskNodeController.selectTaskDiv($(MainSectionPrefixes.PREFIX_DIV_TASK + taskFromServer.id));
                    }
                }
            }

        };
    }

    var getOffset = function(taskDiv) {
        var parent = taskDiv;
        var result = 0;

            while (parent != $('main')) {
                result += parent.offsetTop;
                parent = parent.parentNode;
            }

        return result;
    }
}

function TaskListNodeController() {
    /* Draws child tasks for a task list
     object taskList - a task list to draw
     object ul - an ul section - a parent for <li> sections (which are tasks) */
    this.InsertTasksNodesForTaskList = function(taskList, ul) {
        InsertNoTasksNode(taskList, ul);

        if (taskList.tasks && taskList.tasks.length > 0) {

            for (var j=0; j < taskList.tasks.length; j++) {
                taskNodeController.InsertTaskNode(taskList.id, taskList.tasks[j], ul, false);
            } // for j
        } // if
        else {
            $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskList.id).style.display = '';
        }
    }

    // рисование нода, соответствующего таск листу
    // object taskList - изображаемый таск лист
    // ulMain - корень дерева, для которого ноды с таск листами являются дочерними
    this.InsertTaskListNode = function(taskList, ulMain) {
        var li = document.createElement('li');
        li.setAttribute("id", MainSectionPrefixes.PREFIX_LI_TASKLIST + taskList.id);
        var span = createSimpleTextNode(taskList.title , MainSectionPrefixes.PREFIX_SPAN_TASKLIST + taskList.id);
        li.appendChild(span);
        li.taskListId = taskList.id;
        li.taskList = taskList;
        ulMain.appendChild(li);

        var ul = document.createElement('ul'); // assume + create <ul>
        ul.setAttribute("id", MainSectionPrefixes.PREFIX_UL_TASKLIST + taskList.id);
        li.appendChild(ul);
    }

    // удалить ноды с таск листами, которые были удалены
    // array[] taskListsCurr - последний полученный с сервера список списков задач
    // array[] taskListsOld - предпоследний полученный с сервера список списков задач (изображённый на экране в данный момент)
    this.DeleteTaskListNodesNotExist = function(taskListsCurr, taskListsOld) {
        // анализируем что было удалено
        var founded;
        var toDelete = [];
        for (var i=0; i < taskListsOld.length; i++) {
            var taskListId = taskListsOld[i].id;

            founded = false;
            for (var j=0; j< taskListsCurr.length; j++) {
                if (taskListsCurr[j].id == taskListId) {
                    founded = true;
                    break;
                }
            }

            if (!founded) {
                toDelete.push(taskListId);
            }
        }

        // удаляем то, что было удалено
        for (var i=0; i< toDelete.length; i++) {
            var liTaskList = $( MainSectionPrefixes.PREFIX_LI_TASKLIST + toDelete[i]);
            liTaskList.parentNode.removeChild(liTaskList);
        }
    }

    // sets a task list Title for a task List span
    // taskList - a taskList which is connected to a taskList span
    this.SetTaskListTitle = function(taskList) {
        var taskListSpan = $(MainSectionPrefixes.PREFIX_SPAN_TASKLIST + taskList.id);
        taskListSpan.innerText = taskList.title;
    }

    /*Adds <no task> element to each task List ul section*/
    var InsertNoTasksNode = function(taskList, ul) {
        var liChild = document.createElement('li');
        liChild.setAttribute("id", MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskList.id);

        liChild.appendChild(document.createTextNode('<' +  getLangValue("no_tasks_title") + '>'));
        liChild.style.display = 'none';

        liChild.addEventListener('click', OnTaskDivClick, false);

        ul.appendChild(liChild);
    }

    var OnTaskDivClick = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;

        if (taskNodeController.selectedTaskDiv) {
            taskNodeController.selectedTaskDiv.style.background = 'white';

            // нажатие на тот же самый таск отменяет выбор таска
            if (taskNodeController.selectedTaskDiv == targ) {
                taskNodeController.selectedTaskDiv = null;

                disableButton($('button-insert-task'));
                disableButton($('button-delete-task'));
                disableButton($('button-modify-task'));
                return;
            }
        }

        taskNodeController.selectedTaskDiv = targ;
        taskNodeController.selectedTaskDiv.style.background = '#F3E2A9'; // light yellow

        enableButton($('button-insert-task'));
        disableButton($('button-delete-task'));
        disableButton($('button-modify-task'));
    }
}

// can Insert, Update, Delete task nodes
function TaskNodeController() {

    var parent = this;
    this.selectedTaskDiv = null; // выбранный таск

    // редактирует нод соотетствующий таску в секции Main
    // object taskFromServer - задача с изменениями (пришедшая с сервера)
     this.UpdateTaskNode = function(taskFromServer) {
        if (taskFromServer) {

            SetTaskStatusCheckbox(taskFromServer);
            SetTaskTitle(taskFromServer);

            var taskDiv = $(MainSectionPrefixes.PREFIX_DIV_TASK + taskFromServer.id);

            SetDisplayStatusOverdue(taskFromServer);

            if (taskFromServer.notes != taskDiv.task.notes) {

                SetDisplayTaskStatusAddImages(taskFromServer);
                subTaskDivMainController.RecreateSubTaskDiv(taskDiv, taskFromServer);
            }

            taskDiv.task = taskFromServer;
        }
    }

    // создаёт нод соотетствующий таску в секции Main
    // string taskListId - идентификатор таск листа, которому принадлежит таск
    // object taskFromServer - новая задача (с сервера)
    // object ul - родительский элемент (ul таск листа)
    this.InsertTaskNode = function(taskListId, taskFromServer, ul, insertBefore) {
        var liChild = document.createElement('li');
        liChild.setAttribute("id", MainSectionPrefixes.PREFIX_LI_TASK + taskFromServer.id);
        var taskDiv = createTaskDiv(taskFromServer, taskListId);

        var span = createSimpleTextNode(taskFromServer.title, MainSectionPrefixes.PREFIX_SPAN_TITLE + taskFromServer.id);
        span.addEventListener("click", OnTaskDivClick, false);

        var checkBox = createCheckBoxForTask(taskFromServer);
        taskDiv.appendChild(checkBox);
        createTaskStatusImages(taskDiv, taskFromServer);
        taskDiv.appendChild(span);

        // стрелочка для перехода в секцию Watch
        var arrow = createArrow(taskFromServer);
        taskDiv.appendChild(arrow);
        liChild.appendChild(taskDiv);

        subTaskDivMainController.RecreateSubTaskDiv(taskDiv, taskFromServer);

        if (insertBefore) {
            ul.insertBefore(liChild, ul.firstChild);
        }
        else {
            ul.appendChild(liChild);
        }

        $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskListId).style.display = 'none';

        // set task statuses
        SetDisplayTaskStatusAddImages(taskFromServer);
        SetDisplayStatusOverdue(taskFromServer);
        SetTaskStatusCheckbox(taskFromServer);
        SetTaskTitle(taskFromServer);

        // disabling checkBox for repeatable task
        checkBox.disabled = $(StatusImagesNames.PREFIX_REPEAT + taskFromServer.id).style.display == '';

        if (checkBox.disabled) {
            checkBox.title = 'If task is repeatable, we can`t change its status! Please use Day by Day for this purpose!';
        }
    }

    // удаляет нод соотетствующий таску в секции Main
    // string taskListId - идентификатор таск листа, которому принадлежит таск
    // object taskFromServer - удаляемая задача (с сервера)
    this.DeleteTaskNode = function(taskFromServer, taskListId) {
        var taskLi = $(MainSectionPrefixes.PREFIX_LI_TASK + taskFromServer.id);
        if (taskLi) {
            if (parent.selectedTaskDiv == $(MainSectionPrefixes.PREFIX_DIV_TASK + taskFromServer.id)) {
                parent.deselectTaskDiv();
            }

            taskLi.parentNode.removeChild(taskLi);
        }

        var taskListUl = $(MainSectionPrefixes.PREFIX_UL_TASKLIST + taskListId);

        if (taskListUl.childNodes.length == 1) {
            // no tasks any more, we should show <no tasks> section
            $(MainSectionPrefixes.PREFIX_LI_NO_TASKS + taskListId).style.display = '';
        }


    }

    this.EditTask = function(taskDiv) {
        if (taskDiv.task && taskDiv.taskListId) {
            // removing previous divSubWatch

            $('watch').task = taskDiv.task;
            $('watch').taskListId = taskDiv.taskListId;

            watchSectionController.SetWatchFieldsFromTask($('watch').task);
            watchSectionController.SetDisableWatchButtons(true);
            showOneSection('watch');
        }
    }

    this.selectTaskDiv = function(taskDiv) {

        if (parent.selectedTaskDiv) {

            // нажатие на тот же самый таск отменяет выбор таска
            if (parent.selectedTaskDiv == taskDiv) {
                parent.deselectTaskDiv();
                return;
            }

            parent.selectedTaskDiv.style.background = 'white';
        }

        parent.selectedTaskDiv = taskDiv;
        parent.selectedTaskDiv.style.background = '#F3E2A9'; // light yellow

        enableButton($('button-insert-task'));
        enableButton($('button-delete-task'));
        enableButton($('button-modify-task'));
    }

    this.deselectTaskDiv = function() {
        parent.selectedTaskDiv = null;
        disableButton($('button-insert-task'));
        disableButton($('button-delete-task'));
        disableButton($('button-modify-task'));
    }

    // sets a task Title for a task span
    // task - a task which is connected to a task span
    var SetTaskTitle = function(task) {
        var taskSpan = $(MainSectionPrefixes.PREFIX_SPAN_TITLE + task.id);
        taskSpan.innerText = task.title;
    }

    // Creates a checkBox completed / needsAction for a task
    // task - the task which is connected to a task Div
    // returns [object checkBox] which should be added to some parent element
    var createCheckBoxForTask = function(task) {
        var checkBox = document.createElement("input");
        checkBox.type = 'checkbox';
        checkBox.setAttribute("id", MainSectionPrefixes.PREFIX_CB_COMPLETED + task.id);

        checkBox.addEventListener('change', function(e) {
            var targ;

            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            var li = targ;
            while (li != null && li.task == undefined) li = li.parentNode;
            var task = li.task;
            OnChangeTaskStatusCB(targ);

            while (li != null && li.taskListId == undefined) li = li.parentNode;

            var m_taskId = targ.id.substring(MainSectionPrefixes.PREFIX_CB_COMPLETED.length);
            var taskListId = li? li.taskListId: '';
            task.status = targ.checked ? TaskStatuses.COMPLETED : TaskStatuses.NEEDS_ACTION;
            requestController.changeTaskStatusRequest(taskListId, m_taskId, targ.checked);
        });

        return checkBox;
    }

    // Creates a task div
    // task - the task which is connected to a task Div
    // int taskListId - the task list id to which this task belongs
    // returns an [object taskDiv] which should be added to some parent element
    var createTaskDiv = function(task, taskListId) {
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
    var createTaskStatusImages = function(taskDiv, task) {
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

    // shows / hides images priority, repeat, alarm in MAIN section
    // task - a task which is connected to a task div, to which images belong
    var SetDisplayTaskStatusAddImages = function(task) {
        if (TaskUtils.additionalSectionExist(task)) {
            var additionalSection = TaskUtils.getAdditionalSection(task);
            $(StatusImagesNames.PREFIX_ALARM + task.id).style.display = TaskUtils.isAlarmedTask(additionalSection) ? '': 'none';
            $(StatusImagesNames.PREFIX_REPEAT + task.id).style.display = TaskUtils.isRepeatableTask(additionalSection) ? '': 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_HIGH + task.id).style.display = TaskUtils.isHighPriorityTask(additionalSection) ? '': 'none';
            $(StatusImagesNames.PREFIX_PRIORITY_LOW + task.id).style.display = TaskUtils.isLowPriorityTask(additionalSection) ? '': 'none';
        }
    }

    // shows / hides overdue image in MAIN section
    // task - a task which is connected to a task div, to which images belong
    var SetDisplayStatusOverdue = function(task) {
        $(StatusImagesNames.PREFIX_OVERDUE + task.id).style.display = TaskUtils.isOverdueTask(task) ? '': 'none';
    }

    // checks / unchecks task checkbox to show task.status
// task - a task which is connected to a task div, to which checkbox belongs
    var SetTaskStatusCheckbox = function(task) {
        var checkBox = $(MainSectionPrefixes.PREFIX_CB_COMPLETED + task.id);

        if (checkBox.checked != (task.status == TaskStatuses.COMPLETED)) {
            checkBox.checked = (task.status == TaskStatuses.COMPLETED);
            setTimeout(function () { OnChangeTaskStatusCB(checkBox); }, 15);
        }
    }

    var OnChangeTaskStatusCB = function(targ) {
        var taskId = targ.id.substring(MainSectionPrefixes.PREFIX_CB_COMPLETED.length);
        var spanId = MainSectionPrefixes.PREFIX_SPAN_TITLE + taskId;

        document.getElementById(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
    }

    var OnTaskDivMouseOver = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;

        targ.style.background='#DFEEFF'; // cyan

        if (targ.task) {
            $(MainSectionPrefixes.PREFIX_ARROW_TITLE + targ.task.id).style.display = '';
        }
    }

    var OnTaskDivMouseOut = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;

        targ.style.background = parent.selectedTaskDiv && targ == parent.selectedTaskDiv ? '#F3E2A9' : 'white';

        if (targ.task) {
            $(MainSectionPrefixes.PREFIX_ARROW_TITLE + targ.task.id).style.display = 'none';
        }
    }

    var OnTaskDivClick = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        // получить div
        targ = targ.parentNode;

        if (targ.id.substring(0, MainSectionPrefixes.PREFIX_DIV_TASK.length) != MainSectionPrefixes.PREFIX_DIV_TASK) {
            return;
        }

        parent.selectTaskDiv(targ);
    }

    var OnArrowClick = function(e) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;

        targ = targ.parentNode;

        parent.EditTask(targ);
    }

    // Creates a status img
    // string url - the Image url
    // task - the task which is connected to a task Div (to form the unique id)
    // prefix - the prefix to an image id
    // returns [object img] which should be added to some parent element
    var createTaskStatusImg = function(url, task, prefix) {
        var img = document.createElement('img');
        img.setAttribute("id", prefix + task.id);
        img.src = url;
        img.width = 12;
        img.height = 12;
        img.style.display = 'none';
        return img;
    }

    var createArrow = function(task) {
        var arrow = createSimpleTextNode( UnicodeSymbols.ARROW_RIGHT, MainSectionPrefixes.PREFIX_ARROW_TITLE + task.id);
        arrow.style.float = 'right';
        arrow.style.display = 'inline-block';
        arrow.style.margin = '0px';
        arrow.style.cursor = 'pointer';
        arrow.style.display = 'none';
        arrow.addEventListener("click",OnArrowClick);
        arrow.title = getLangValue("edit_details");
        return arrow;
    }
}

function SubTaskDivMainController() {
    /*
     Refreshes sub tasks div (removes old section and creates new section)
     object taskDiv - the parent section for a subTaskDiv
     task - a task which is connected to a task Div
     */
    this.RecreateSubTaskDiv = function(taskDiv, task) {
        var notesSection = TaskUtils.getNotesSection(task);
        var subTaskDiv = $(MainSectionPrefixes.PREFIX_DIV_SUBTASK + task.id);

        if (subTaskDiv) {
            subTaskDiv.parentNode.removeChild(subTaskDiv);
        }

        taskDiv.subTask = null;

        if (watchSectionController.canBeConvertedToSubtasks( notesSection)) {
            var subTasks = watchSectionController.convertToSubTasks(notesSection);
            InsertSubTaskDiv(taskDiv, task, subTasks);
            taskDiv.subTasks = subTasks;
        }
    }

    var InsertSubTaskDiv = function(taskDiv, task, subTasks) {
        var subTasksDiv = document.createElement('div');
        subTasksDiv.setAttribute("id", MainSectionPrefixes.PREFIX_DIV_SUBTASK + task.id);
        InsertSubTaskNodes(subTasksDiv, subTasks, task.id);
        taskDiv.appendChild(subTasksDiv);
    }

    // bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
    // false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
    // Draws subTasks for a task
    // object li - parent node (with task name)
    // string[] subTasks - array of subTasks
    // string taskId - the Task id
    // bool forMain - true, draw subTasks for main section ; false, draw subTasks for watch section
    var InsertSubTaskNodes = function(li, subTasks, taskId) {
        for (var k = 0; k< subTasks.length; k++) {
            if (subTasks[k].trim() == '') {
                continue;
            }

            InsertSubTaskNode(li, subTasks[k], taskId, k);
        }
    }

    // Adds a subTask span and a checkbox to a parent task
    // object li - parent node (with task name)
    // string subTask - a name of a subTask
    // string taskId  - parent task`s id
    // int subTaskNum - subtask`s number
    var InsertSubTaskNode = function(li, subTask, taskId, subTaskNum) {
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

            while (li != null && li.taskListId == undefined) li = li.parentNode;


            var taskListId = li? li.taskListId: '';
            var subTaskId = parseInt(targ.id.substring('ch_'.length).substring(m_taskId.length + 1));

            var arr = watchSectionController.convertToSubTasks(oldNotes);
            arr[subTaskId] = (targ.checked ? SubTaskStatuses.COMPLETED_LIST : SubTaskStatuses.NEEDS_ACTION_LIST) + arr[subTaskId].substring(SubTaskStatuses.COMPLETED_LIST.length);
            var newNotes = watchSectionController.convertFromSubTasks(arr);
            task.notes = newNotes;
            requestController.changeSubTaskStatusRequest(taskListId, m_taskId, newNotes);
        });

        span.appendChild(checkBox);
        span.appendChild(createSimpleTextNode(text, MainSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum));
        li.appendChild(span);

        if (isDone) {
            checkBox.checked = true;
            setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);
        }
    }

    var OnChangeSubTaskStatusCB = function(targ) {
        var taskId = targ.id.substring('ch_'.length);
        var spanId = MainSectionPrefixes.PREFIX_SPAN_TITLE + taskId;
        var li = targ;
        while (li != null && li.taskListId == undefined) li = li.parentNode;
        $(spanId).style.textDecoration = targ.checked ? 'line-through':'none';
    }
}

function SubTaskDivWatchController() {
    var parent = this;
    // Creates Sub Tasks Div section And Adds it to taskDiv section as a child
    // object taskDiv - the parent div for a subTasksDiv
    // task - the task which is connected to a task Div
    // string[] subTasks - array of subTasks
    // divNamePrefix - prefix for a SubTasks
    // bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
    //       false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
    this.InsertSubTaskDiv = function(taskDiv, task, subTasks) {
        var subTasksDiv = document.createElement('div');
        subTasksDiv.setAttribute("id", WatchSectionPrefixes.PREFIX_DIV_SUBTASK + task.id);
        InsertSubTaskNodes(subTasksDiv, subTasks, task.id);
        taskDiv.appendChild(subTasksDiv);
        setSubTaskAddVisibility();
    }

    // Removes Sub Tasks div section from Watch section
    this.DeleteSubTasksDiv = function() {
        if ($('watch').task == undefined) {
            return;
        }

        var subTaskDiv = $(WatchSectionPrefixes.PREFIX_DIV_SUBTASK + $('watch').task.id);

        if (subTaskDiv) {
            subTaskDiv.parentNode.removeChild(subTaskDiv);
        }
    }

    // Make subTasks array from a sub Tasks Div
    // Returns string[] subTasks - array of subTasks
    this.getSubTasksArrFromWatchDiv = function() {
        var subTasksDiv = $(WatchSectionPrefixes.PREFIX_DIV_SUBTASK + $('watch').task.id);

        var num = subTasksDiv.children.length;
        var subTasks = [];

        for (var i=0; i<num; i++) {
            var checkBox = $(WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + $('watch').task.id + "_" + i);
            var textNode = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + $('watch').task.id + "_" + i);

            var subTask = checkBox.checked ? SubTaskStatuses.COMPLETED_NOTES: SubTaskStatuses.NEEDS_ACTION_NOTES;
            subTask = subTask + textNode.value;
            subTasks.push(subTask);
        }

        return subTasks;
    }

    // bool forMain - true рисование в секции Main, там нажатие на чекбокс приводит к немедленному запросу на правку
// false - рисование в секции Watch, там нажатие на чекбокс не приводит к запросу на редактирование
// Draws subTasks for a task
// object li - parent node (with task name)
// string[] subTasks - array of subTasks
// string taskId - the Task id
// bool forMain - true, draw subTasks for main section ; false, draw subTasks for watch section
    var InsertSubTaskNodes = function(li, subTasks, taskId) {
        for (var k = 0; k< subTasks.length; k++) {
            if (subTasks[k].trim() == '') {
                continue;
            }

            InsertSubTaskNode(li, subTasks[k], taskId, k);
        }
    }

    // создать секцию div для сабтаска в секции Watch и присоединить её к li как дочернюю
    // object li - родительский нод
    // string subTask - название сабтаска
    // string taskId - идентификатор таска
    // int subTaskNum - номер subTaskа
    var InsertSubTaskNode = function(li, subTask, taskId, subTaskNum) {
        var divSubTask = document.createElement('div');
        var isDone = subTask.substring(0,1) == 'T';
        var text = subTask.substring(1);

        var checkBox =  createCheckBox(taskId, subTaskNum);
        divSubTask.appendChild(checkBox);

        var editBox = createEditBox(taskId, subTaskNum, text);
        divSubTask.appendChild(editBox);

        // span.appendChild(createSimpleTextNode(text, WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum));
        li.appendChild(divSubTask);
        // span.setAttribute("id", WatchSectionPrefixes.PREFIX_DIV_SUBTASK + taskId);

        // удаление сабТакса
        var a = createCrossDeleteSubTask(taskId, subTaskNum);
        divSubTask.appendChild(a);

        // добавление сабТаска
        var aplus = createPlusAddSubTask(taskId, subTaskNum);
        divSubTask.appendChild(aplus);

        if (isDone) {
            checkBox.checked = true;
            // setTimeout(function () { OnChangeSubTaskStatusCB(checkBox);}, 15);
        }
    }

    // добавление нового (пустого сабтаска) в секцию divsubwatch
    // object targ - "плюсик" (не используется)
    var InsertEmptySubTaskNode = function(targ) {
        var subTasks = parent.getSubTasksArrFromWatchDiv();
        var subTasksDiv = $(WatchSectionPrefixes.PREFIX_DIV_SUBTASK + $('watch').task.id);
        var subTaskNum = subTasks.length;

        InsertSubTaskNode(subTasksDiv , 'F', $('watch').task.id, subTaskNum);
        setSubTaskAddVisibility();
    }

    // удаление сабтаска из секции divsubwatch
// object targ - "крестик", на который нажали
    var DeleteSubTaskNode = function(targ) {
        // получить номер удаляемого сабтаска
        var subTaskNum = parseInt(targ.id.substring(WatchSectionPrefixes.PREFIX_A_SUBTASK_REMOVE.length).split('_')[1]);
        var subTasks = parent.getSubTasksArrFromWatchDiv();

        // нельзя удалить единственный сабтаск
        if (subTasks.length == 1) {
            return;
        }

        // пердвинуть все значения вверх, потеряв удаляемое, но сохранив имена элементов
        for (var i = subTaskNum;  i < subTasks.length - 1;i++) {
            var checkBox = $(WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + $('watch').task.id + "_" + i);
            var textNode = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + $('watch').task.id + "_" + i);
            var checkBoxNext = $(WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + $('watch').task.id + "_" + (i + 1).toString());
            var textNodeNext = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + $('watch').task.id + "_" + (i + 1).toString());

            checkBox.checked = checkBoxNext.checked;
            textNode.value = textNodeNext.value;
        }

        var textNode = $(WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + $('watch').task.id + "_" + (subTasks.length - 1).toString());

        // удалить последний div
        var subTaskDiv = textNode.parentNode;

        if (subTaskDiv) {
            subTaskDiv.parentNode.removeChild(subTaskDiv);
        }

        setSubTaskAddVisibility();
    }

    // установить видимость "плюсика" - для добавления сабТаска
    // плюсик всегда виден только у последнего сабтаска
    var setSubTaskAddVisibility = function() {
        var subTasks =  parent.getSubTasksArrFromWatchDiv();

        for (var i = 0;  i < subTasks.length - 1;i++) {
            $(WatchSectionPrefixes.PREFIX_A_SUBTASK_ADD + $('watch').task.id + "_" + i).style.display = 'none';
        }

        $(WatchSectionPrefixes.PREFIX_A_SUBTASK_ADD + $('watch').task.id + "_" + (subTasks.length - 1)).style.display = '';
    }

    var createCheckBox = function(taskId, subTaskNum) {
        var checkBox = document.createElement("input");
        checkBox.type = 'checkbox';
        checkBox.setAttribute("id", WatchSectionPrefixes.PREFIX_CB_SUBTASK_COMPLETED + taskId + "_" + subTaskNum);
        checkBox.addEventListener('change', function(e) {
            watchSectionController.OnSomeEditDone();
        });

        return checkBox;
    }

    var createEditBox = function(taskId, subTaskNum, text) {
        var editBox = document.createElement("input");
        editBox.type = 'text';
        editBox.setAttribute("id", WatchSectionPrefixes.PREFIX_SPAN_SUBTASK_TITLE + taskId + "_" + subTaskNum);
        editBox.placeholder = getLangValue("sub_title_default");
        editBox.value = text;
        editBox.style.width = '60%';
        editBox.style.minHeight = '15px';
        editBox.style.height = '15px';
        editBox.style.display = 'inline-block';
        editBox.addEventListener('keyup', function(e) {
            watchSectionController.OnSomeEditDone();
        });

        return editBox;
    }

    var createCrossDeleteSubTask = function(taskId, subTaskNum) {
        var a = document.createElement('a');
        a.href =  '#';
        a.innerText = ' ' + UnicodeSymbols.CLOSE;
        a.setAttribute("id", WatchSectionPrefixes.PREFIX_A_SUBTASK_REMOVE + taskId + "_" + subTaskNum);
        a.addEventListener('click', function(e) {
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            DeleteSubTaskNode(targ);
            watchSectionController.OnSomeEditDone();
        });

        return a;
    }

    var createPlusAddSubTask = function(taskId, subTaskNum) {
        var aplus = document.createElement('a');
        aplus.href =  '#';
        aplus.innerText = ' ' + UnicodeSymbols.PLUS;
        aplus.setAttribute("id", WatchSectionPrefixes.PREFIX_A_SUBTASK_ADD + taskId + "_" + subTaskNum);
        aplus.addEventListener('click', function(e) {
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            InsertEmptySubTaskNode(targ);
            watchSectionController.OnSomeEditDone();
        });

        return aplus;
    }
}

var StatusImagesNames = (function() {
    var URL_IMAGES_FOLDER = baseUrlImg;
    var urlAlarm = URL_IMAGES_FOLDER + "ic_tiny_alarm_light.png";
    var urlOverdue = URL_IMAGES_FOLDER + "ic_tiny_overdue_light.png";
    var urlRepeat = URL_IMAGES_FOLDER + "ic_tiny_repeat_light.png";
    var urlPriorityHigh = URL_IMAGES_FOLDER + "ic_tiny_priority_high_light.png";
    var urlPriorityLow = URL_IMAGES_FOLDER + "ic_tiny_priority_low_light.png";

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
        PREFIX_LI_TASKLIST: "litl_",
        PREFIX_SPAN_TASKLIST: "tl_",
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
        PREFIX_SPAN_SUBTASK_TITLE: "t_w_",
        PREFIX_A_SUBTASK_REMOVE: "a_w_",
        PREFIX_A_SUBTASK_ADD: "a_wa_"
    };})();

var TaskStatuses = (function() {
    return {
        COMPLETED: "completed",
        NEEDS_ACTION: "needsAction"
    };})();

var SubTaskStatuses = (function() {
    return {
       COMPLETED_NOTES: "[x]", // в комментарии к задаче
       NEEDS_ACTION_NOTES: "[ ]", // в комментарии к задаче
       COMPLETED_LIST: "T", // в списке subTaskList
       NEEDS_ACTION_LIST: "F" // в списке subTaskList
    };})();

var UnicodeSymbols = (function() {
    return {
        CLOSE: '\u2715',
        PLUS: '\uFF0B',
        ARROW_RIGHT: '\u25B6',
        GALKA: '\u2714',
        ARROW_DOWN: '\u25BC'
    };})();








