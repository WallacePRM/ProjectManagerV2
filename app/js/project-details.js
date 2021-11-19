
function ProjectDetails() {

    let newTask;
    let currentProject = null;

    this.show = function(project) {

        currentProject = project;

        const projectTime = calcTimeProject(project);
        const $contentRight = $('.content-right');

        $contentRight.find('.project-name h3').html(project.name);
        $contentRight.find('.project-description').html(project.description);
        
        if (project.price !== '') {
            $contentRight.find('.timer-register .price').html(`<span>R$</span> ${project.price}`);
        }
        else {
            $contentRight.find('.timer-register .price').html('');
        }

        if (project.estimated_time !== '') {
            $contentRight.find('.timer-register .duration').html(`Estimated time: ${project.estimated_time}<span>${formatTime(projectTime)}</span>`);
        }   
        else {
            $contentRight.find('.timer-register .duration').html(`<span>${formatTime(projectTime)}</span>`);
        }
        
        $contentRight.find('.tasks-list').html('');

        if (project.tasks) {

            for (let i = 0; i < project.tasks.length; i++) {
                createTaskHTML(project.tasks[i]);
            }
        }   

        $('.content').addClass('show');
    }

    function bindEvents() {

        $('.btn-play-pause').on('click', handlePlayPause);
        $('.btn-stop').on('click', handleStop);
        $('.content-right .btn-close').on('click', handleHiddenProjectDetails);
        $('.content-right .project-name-left').on('click', handleHiddenDescription);
        $('.btn-delete').on('click', handleDeleteProject);
    }

    function createTaskHTML(task) { 

        const $contentRight = $('.content-right');

        $contentRight.find('.tasks-list').append(`
            <div class="task-item" data-id="${task.id}">
                <span>${task.name}</span>
                <span class="task-time">${formatTime(calcTime(task.history || []))}</span>
            </div>
        `);
    }

    /* ------------------ FUNCTIONS HANDLE ------------------ */

    async function handlePlayPause(event) {

        const $btn = $(event.currentTarget);

        try {
            currentProject = (await getProjects(currentProject.id))[0];
        }
        catch(error) {

            console.error(error);

            toastError('Failed to perform operation');

            return;
        }

        const lastTaskIndice = currentProject.tasks.length - 1;
        const lastTask = currentProject.tasks[lastTaskIndice];
        let lastHistory;

        if ($btn.find('.fa-play').length > 0) {

            if (lastTask !== undefined) {

                const lastHistoryIndice = lastTask.history.length - 1;
                lastHistory = lastTask.history[lastHistoryIndice];
            }

            windowCondition = lastHistory;
            const isStopped = lastHistory && lastHistory.action === 'stop';

            if (currentProject.tasks.length === 0 || isStopped) {

                newTask = new Modal({
                    title: 'New Task',
                    content: `
                        <div class="modal-new-task">
                            <form>
                                <div class="new-task-content">
                                    <div class="row">
                                        <label>Task name:</label>
                                        <input name="task-name" type="text">
                                    </div>
                                    <div class="row error-field"></div>
                                </div>
                                <div class="row btn-footer">
                                    <button class="btn btn-primary">Create</button>
                                </div>
                            </form>
                        </div>
                    `
                });
                
                newTask.show();

                $('.modal-new-task .btn').on('click', handleCreateTask);
            }
            else {
            
                $btn.html('<i class="fas fa-pause"></i>Pause');
                $('.btn-stop').removeAttr('disabled');
                $('.content-left').addClass('disabled');
                $('.content-right .btn-close').addClass('disabled');
                $('.site .header').addClass('disabled');

                playPause('play', lastTask, currentProject);
            }
        }
        else {
            $btn.html('<i class="fas fa-play"></i>Start');
            $('.btn-stop').attr('disabled', true);
            $('.content-left').removeClass('disabled');
            $('.content-right .btn-close').removeClass('disabled');
            $('.site .header').removeClass('disabled');

            playPause('pause', lastTask, currentProject);
        }
    }

    function handleStop() {

        const lastTaskIndice = currentProject.tasks.length - 1;
        const lastTask = currentProject.tasks[lastTaskIndice];

        $('.btn-play-pause').html('<i class="fas fa-play"></i>Start');
        $('.btn-stop').attr('disabled', true);
        $('.content-left').removeClass('disabled');
        $('.content-right .btn-close').removeClass('disabled');
        $('.site .header').removeClass('disabled');

        stopInterval('stop', lastTask, currentProject.id);
    }

    async function handleCreateTask(event) {

        try {

            event.preventDefault();

            const $modal = $(event.currentTarget).closest('.modal-new-task');
            const $taskNameInput = $modal.find('[name="task-name"]');
            const taskName = $taskNameInput.val();

            $taskNameInput.removeClass('error');
            $taskNameInput.attr('placeholder', '');
           
            let task = { 
                name: taskName
            };

            $('.modal-new-task [name="task-name"]').removeClass('error');

            const result = await postTask(task, currentProject.id);
            if (result.message) {

                $('.background-load').removeClass('show');
                showErrors(result, $('.modal-new-task .error-field'));
    
                return;
            }

            task = result;
            currentProject = (await getProjects(currentProject.id))[0];

            newTask.hide();
            createTaskHTML(task);

            $('.btn-play-pause').html('<i class="fas fa-pause"></i>Pause');
            $('.btn-stop').removeAttr('disabled');

            $(`[data-id="${currentProject.id}"] .project-item-bottom span`).html(taskName);

            $('.site .header').addClass('disabled');
            $('.content-left').addClass('disabled');
            $('.content-right .btn-close').addClass('disabled');

            playPause('play', task, currentProject);
        }
        catch (error) {

            console.error(error);

            toastError('Failed to perform operation');
        }
    }
    
    function handleHiddenProjectDetails() {

        $('.project-item').removeClass('active');
        $('.arrow').removeClass('fas fa-chevron-left');
        $('.arrow').addClass('fas fa-chevron-right');

        $('.content').removeClass('show');
        $('.btn-delete').removeClass('show');
    }

    function handleHiddenDescription() {

        const $projectDescription = $('.content-right .project-description');
        const $icon = $('.content-right .project-name-left i');
        const descriptionAttr = $projectDescription.attr('class');

        $projectDescription.toggleClass('hidden');

        if (descriptionAttr === 'project-description hidden') {
            $icon.removeAttr('class');
            $icon.attr('class', 'fas fa-caret-down')
        }
        else {
            $icon.removeAttr('class');
            $icon.attr('class', 'fas fa-caret-right')
        }
    }

    async function handleDeleteProject() {

        try {

            const result = await deleteProject(currentProject.id);
            if (result.message) {

                toastError(result.message);

                return;
            }

            const projects = $('.project-item').toArray();
            for (let i = 0; i < projects.length; i++) {

                let $project = $(projects[i]);

                if ($project.attr('data-id') === `${currentProject.id}`) {

                    $project.remove();
                }
            }

            if ( $('.project-item').toArray().length === 0) {

                $('.content-left .empty-msg').css('display', 'block');
            }

            $('.content-right .btn-close').click()
            toastSucess('Project deleted successfully');
        }
        catch(error) {

            console.error(error);

            toastError('Failed to perform operation');
        }
    }

    bindEvents();
}

