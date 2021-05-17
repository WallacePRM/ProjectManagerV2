
let projectDetails;
let newProject;

/* ------------------ Initial ------------------ */

$(document).ready(function() {

    projectDetails = new ProjectDetails();

    loadProjects();

    $('.header .menu-item .new-project').on('click', handleNewProject);
    $('.header .search-bar input').on('keyup', handleFindProject);
    $('.header .download').on('click', handleDownloadData);
    $('.header [name="backupFile"]').on('change', handleImportBackup);
    $('.header .btn-options').on('click', handleShowOptions);
});

async function loadProjects() {

    try {

        $('.content-left .project-item').remove();

        await appData.getProjects();

        for (let i = 0; i < projects.length; i++) {

            addProjectHTML(projects[i]);
        }
    }
    catch (error) {

        console.error(error);
    }
}

function addProjectHTML(project) {

    const projectTime = calcTimeProject(project);
    const lastIndex = project.tasks.length - 1;
    const lastTask = project.tasks[lastIndex];

    const $projectItem = $(`
        <div class="project-item" data-id="${project.id}">
            <div class="project-item-top">
                <span class="project-name">${project.name}</span>
                <span class="time">${formatTime(projectTime)}</span>
            </div>
            <i class="arrow fas fa-chevron-right"></i>
            <div class="project-item-bottom">
                <span>${lastTask ? lastTask.name : ''}</span>
            </div>
        </div>
    `);

    $('.content-left').append($projectItem);
    $('.content-left .empty-msg').css('display', 'none');

    $projectItem.on('click', handleShowProjectDetails);
}

/* ------------------ HANDLE ------------------ */

function handleNewProject() {

    newProject = new Modal({
        title: 'New Project',
        content: `
            <div class="modal-new-project">
                <form>
                    <div class="row">
                        <label>Project name *</label>
                        <input name="project-name" type="text" required>
                    </div>
                    <div class="row">
                        <label>Project description</label>
                        <textarea name="project-description" type="text"></textarea>
                    </div>
                    <div class="row">
                        <label>Project price</label>
                        <input name="project-price" type="number">
                    </div>
                    <div class="row">
                        <label>Estimated time</label>
                        <input name="project-estimated-time" placeholder="HH:MM" type="text">
                    </div>
                    <div class="row">
                        <button class="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        `
    });

    newProject.show();
    
    $('[name="project-estimated-time"]').mask('00:00');    
    $('.modal-new-project .btn').on('click', handleCreateProject);
}

function handleShowProjectDetails(event) {

    $('.project-item').removeClass('active');
    $('.arrow').removeClass('fas fa-chevron-left');
    $('.arrow').addClass('fas fa-chevron-right');

    const $projectItem = $(event.currentTarget);
    const id = parseInt($projectItem.attr('data-id'));

    const project = appData.getProjectById(id);

    $projectItem.find('.arrow').removeClass('fas fa-chevron-right');
    $projectItem.find('.arrow').addClass('fas fa-chevron-left');
    $projectItem.addClass('active');

    projectDetails.show(project);
}

async function handleCreateProject(event) {

    try {
        event.preventDefault();

        const $modal = $(event.currentTarget).closest('.modal-new-project');
        
        $modal.find('[name="project-name"]').removeClass('error');
        $modal.find('[name="project-name"]').attr('placeholder', '');

        const projectName = $modal.find('[name="project-name"]').val();
        
        if (projectName === '') {

            $modal.find('[name="project-name"]').addClass('error');
            $modal.find('[name="project-name"]').attr('placeholder', 'Required field');

            return;
        }
        
        const projectDescription = $modal.find('[name="project-description"]').val();
        const projectPrice = $modal.find('[name="project-price"]').val();
        const estimatedTime = $modal.find('[name="project-estimated-time"]').val();

        const project = {
            name: projectName,
            description: projectDescription,
            price: projectPrice,
            estimatedTime: estimatedTime,
            tasks: []
        };

        await appData.createProject(project);

        addProjectHTML(project);
        newProject.hide();   

    }
    catch (error) {

        console.error(error);

        // Notificação de error
    }
}

function handleFindProject() {

    const search = $('.header .search-bar input').val().toLowerCase();
    const projectList = $('.content-left .project-item').toArray();
    let foundItens = false;

    for (let i = 0; i < projectList.length; i++) {

        const projectName = $(projectList[i]).find('.project-name').html().toLowerCase();

        if (projectName.indexOf(search) === -1) {
            $(projectList[i]).css('display', 'none');
        }
        else {
            $(projectList[i]).css('display', 'flex');
            foundItens = true;
        }
    }

    if (foundItens) {
        $('.content-left .empty-msg').css('display', 'none');
    }
    else {
        $('.content-left .empty-msg').css('display', 'block');
    }
}

function handleShowOptions() {

    const $options = $('.options');

    if ($options.attr('class') === 'options') {

        $options.addClass('show');
        $('.logo-name').css('opacity', '0');

        $('.btn-options').removeClass('ti-menu');
        $('.btn-options').addClass('ti-close');

        $('.search-bar').addClass('disabled');
        $('.header-bottom').addClass('disabled');
        $('.content').addClass('disabled');
    }
    else {
        $options.removeClass('show');
        $('.logo-name').css('opacity', '1');

        $('.btn-options').removeClass('ti-close');
        $('.btn-options').addClass('ti-menu');

        $('.search-bar').removeClass('disabled');
        $('.header-bottom').removeClass('disabled');
        $('.content').removeClass('disabled');
    }
}

function handleDownloadData() {

    const jsonProjects = JSON.stringify(projects);

    const blob = new Blob([jsonProjects], {type: 'text/plan;charset=utf-8'});
    const url =  URL.createObjectURL(blob);

    const $link = $(`<a href="${url}" download="ProjectManagerV2_Backup.txt">download</a>`);

    $link[0].click();
}

function handleImportBackup(event) {

    const file = event.currentTarget.files[0];
    const reader = new FileReader();

    reader.onload = function() {

        const importedProjects = JSON.parse(reader.result);

        projects = projects.concat(importedProjects);

        appData.saveData();
        loadProjects();

        $(event.currentTarget).val(null);
    };

    reader.readAsText(file);
}