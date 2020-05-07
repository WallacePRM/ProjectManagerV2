
var intervalId;

function calcTime(history) {

    var time = 0;

    for (var i = 0; i < history.length; i++) {

        if (history[i].action === 'play') {
            var d1 = new Date(history[i].date);
            var d2;

            if (history[i + 1] !== undefined) {
                d2 = new Date(history[i + 1].date);
            }
            else {
                d2 = new Date();
            }

            time = time + ((d2 - d1) / 1000);
        }
    }

    return time;
}

function calcTimeProject(project) {

    var projectTime = 0;

    for (var t = 0; t < project.tasks.length; t++) {

        projectTime = projectTime + calcTime(project.tasks[t].history);
    }

    return projectTime;
}

function formatTime(time) {

    var hourTemp = time / 3600;
    var hour = Math.trunc(hourTemp);

    var minutesTemp = (hourTemp - hour) * 60;
    var minutes =  Math.trunc(minutesTemp);

    var seconds = Math.round((minutesTemp - minutes) * 60);

    var hStr = hour.toString().padStart(2, '0');
    var mStr = minutes.toString().padStart(2, '0');
    var sStr = seconds.toString().padStart(2, '0');

    return `${hStr}:${mStr}:${sStr}`;
}

function startInterval(project) {

    var lastTaskIndice = project.tasks.length - 1;
    var lastTask = project.tasks[lastTaskIndice];

    intervalId = setInterval(function() {

        var time = calcTimeProject(project);
        var timeFormated = formatTime(time);

        $('.timer-register .duration span').html(timeFormated);
        $(`.content-left [data-id="${project.id}"]`).find('.time').html(`${timeFormated}`);

        // --------------------------------

        var time = calcTime(lastTask.history);
        var timeFormated = formatTime(time);

        $(`[data-id="${lastTask.id}"] .task-time`).html(timeFormated);  
    },100);
}

function playPause(action, currentTask, project) {

    appData.addTaskHistory(action, project.id, currentTask.id);

    if (action === 'pause') {
        clearInterval(intervalId);
    }
    else {
        startInterval(project);
    }
}

function stopInterval(action, currentTask, projectId) {

    appData.addTaskHistory(action, projectId, currentTask.id);

    clearInterval(intervalId);
}
