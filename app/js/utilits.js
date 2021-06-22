
let intervalId;

function calcTime(history) {

    let time = 0;

    for (let i = 0; i < history.length; i++) {

        if (history[i].action === 'play') {
            let d1 = new Date(history[i].date);
            let d2;

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

    let projectTime = 0;

    for (let t = 0; t < project.tasks.length; t++) {

        projectTime = projectTime + calcTime(project.tasks[t].history || []);
    }

    return projectTime;
}

function formatTime(time) {

    const hourTemp = time / 3600;
    const hour = Math.trunc(hourTemp);

    const minutesTemp = (hourTemp - hour) * 60;
    const minutes =  Math.trunc(minutesTemp);

    const seconds = Math.round((minutesTemp - minutes) * 60);

    const hStr = hour.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    return `${hStr}:${mStr}:${sStr}`;
}

function startInterval(project) {

    const lastTaskIndice = project.tasks.length - 1;
    const lastTask = project.tasks[lastTaskIndice];

    intervalId = setInterval(function() {

        let time = calcTimeProject(project);
        let timeFormated = formatTime(time);

        $('.timer-register .duration span').html(timeFormated);
        $(`.content-left [data-id="${project.id}"]`).find('.time').html(`${timeFormated}`);

        // --------------------------------

        time = calcTime(lastTask.history);
        timeFormated = formatTime(time);

        $(`[data-id="${lastTask.id}"] .task-time`).html(timeFormated);  
    },100);
}

async function playPause(action, currentTask, project) {

    try {

        const token = getToken();
        await postHistory(action, project.id, currentTask.id, token);
        project = (await getProjects(project.id, token))[0];

        if (action === 'pause') {
            clearInterval(intervalId);

            window.onbeforeunload = () => {};
        }
        else {
            startInterval(project);

            window.onbeforeunload = async (event) => {

                const message = 'Important: Please click on \'Save\' button to leave this page.';
                
                if (typeof event == 'undefined') {
                    event = window.event;
                }
            
                if (event) {
                    event.returnValue = message;
                }

                await postHistory('pause', project.id, project.tasks[project.tasks.length - 1].id);
            
                return message;
            };
        }
    }
    catch(error) {

        console.error(error);

        toastError('Falha ao realizar a operação');
    }
}

async function stopInterval(action, currentTask, projectId) {

    try {
        window.onbeforeunload = () => {};
        
        const token = getToken();
        await postHistory(action, projectId, currentTask.id, token);

        clearInterval(intervalId);
    }
    catch(error) {

        console.error(error);

        toastError('Falha ao realizar a operação');
    }
}

function toastError(message, duration) {

    Toastify({
        text: message,
        duration: duration || 3000,
        gravity: 'bottom',
        position: 'left',
        backgroundColor: "linear-gradient(to right, #e2404f, #fb5c42)"
    }).showToast();
}

function toastSucess(message, duration) {

    Toastify({
        text: message,
        duration: duration || 3000,
        gravity: 'bottom',
        position: 'left',
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
    }).showToast();
}