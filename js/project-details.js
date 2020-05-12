
function ProjectDetails() {

    var newTask;
    var currentProject = null;


    this.show = function(project) {

        currentProject = project;

        var projectTime = calcTimeProject(project);
        var $contentRight = $('.content-right');

        $contentRight.find('.project-name h3').html(project.name);
        $contentRight.find('.project-description').html(project.description);
        
        if (project.price !== '') {
            $contentRight.find('.timer-register .price').html(`<span>R$</span> ${project.price}`);
        }
        else {
            $contentRight.find('.timer-register .price').html('');
        }

        if (project.estimatedTime !== '') {
            $contentRight.find('.timer-register .duration').html(`Estimated Time: ${project.estimatedTime}<span>${formatTime(projectTime)}</span>`);
        }   
        else {
            $contentRight.find('.timer-register .duration').html(`<span>${formatTime(projectTime)}</span>`);
        }
        
        $contentRight.find('.tasks-list').html(`
            <h3>Tarefas</h3>
        `);
        
        if (project.tasks) {

            for (var i = 0; i < project.tasks.length; i++) {
                createTaskHTML(project.tasks[i]);
            }
        }   

        $('.content').addClass('show');
    }

    function bindEvents() {

        $('.btn-play-pause').click(handlePlayPause);
        $('.btn-stop').click(handleStop);
        $('.content-right .fa-times').click(handleHiddenProjectDetails);
        $('.content-right .project-name-left').click(handleHiddenDescription);
    }

    function createTaskHTML(task) { 

        var $contentRight = $('.content-right');

        $contentRight.find('.tasks-list').append(`
            <div class="task-item" data-id="${task.id}">
                <span>${task.name}</span>
                <span class="task-time">${formatTime(calcTime(task.history))}</span>
            </div>
        `);
    }

    /* ------------------ Functions HANDLE ------------------ */

    function handlePlayPause(event) {

        var $btn = $(event.currentTarget);
        var lastTaskIndice = currentProject.tasks.length - 1;
        var lastTask = currentProject.tasks[lastTaskIndice];

        if ($btn.find('.fa-play').length > 0) {

            if (lastTask !== undefined) {

                var lastHistoryIndice = lastTask.history.length - 1;
                var lastHistory = lastTask.history[lastHistoryIndice];
            }

            if (currentProject.tasks.length === 0 || lastHistory.action === 'stop') {

                newTask = new Modal({
                    title: 'New Task',
                    content: `
                        <div class="modal-new-task">
                            <div class="row">
                                <label>Task name:</label>
                                <input name="task-name" type="text">
                            </div>
                            <div class="row">
                                <button class="btn btn-primary">Create</button>
                            </div>
                        </div>
                    `
                });
                
                newTask.show();

                $('.modal-new-task .btn').click(handleCreateTask);
            }
            else {
            
                $btn.html('<i class="fa fa-pause"></i>Pause');
                $('.btn-stop').removeAttr('disabled');
                $('.content-left').addClass('disabled');
                $('.content-right .fa-times').addClass('disabled');

                playPause('play', lastTask, currentProject);
            }
        }
        else {
            $btn.html('<i class="fa fa-play"></i>Start');
            $('.btn-stop').attr('disabled', true);
            $('.content-left').removeClass('disabled');
            $('.content-right .fa-times').removeClass('disabled');

            playPause('pause', lastTask, currentProject);
        }

    }

    function handleStop() {

        var lastTaskIndice = currentProject.tasks.length - 1;
        var lastTask = currentProject.tasks[lastTaskIndice];

        $('.btn-play-pause').html('<i class="fa fa-play"></i>Start');
        $('.btn-stop').attr('disabled', true);
        $('.content-left').removeClass('disabled');
        $('.content-right .fa-times').removeClass('disabled');

        stopInterval('stop', lastTask, currentProject.id);
    }

    function handleCreateTask() {

        var taskName = $('.modal-new-task [name="task-name"]').val();

        if (taskName !== '') {

            $('.modal-new-task [name="task-name"]').removeClass('error');

            var promise = appData.createTask(taskName, currentProject.id);

            promise.then(function(task) {

                newTask.hide();
                createTaskHTML(task);

                $('.btn-play-pause').html('<i class="fa fa-pause"></i>Pause');
                $('.btn-stop').removeAttr('disabled');

                $(`[data-id="${currentProject.id}"] .project-item-bottom span`).html(taskName);

                $('.content-left').addClass('disabled');
                $('.content-right .fa-times').addClass('disabled');

                playPause('play', task, currentProject);
            });
        }
        else {
            $('.modal-new-task [name="task-name"]').addClass('error');
        }
    }
    
    function handleHiddenProjectDetails() {

        $('.content').removeClass('show');
    }

    function handleHiddenDescription() {

        var $projectDescription = $('.content-right .project-description');
        var $icon = $('.content-right .project-name-left i');
        var descriptionAttr = $projectDescription.attr('class');

        $projectDescription.toggleClass('hidden');

        if (descriptionAttr === 'project-description hidden') {
            $icon.removeAttr('class');
            $icon.attr('class', 'fa fa-caret-down')
        }
        else {
            $icon.removeAttr('class');
            $icon.attr('class', 'fa fa-caret-right')
        }

    }

    /* ------------------ Initial ------------------ */

    bindEvents();
}

