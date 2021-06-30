
let projectDetails;
let newProject;

/* ------------------ Initial ------------------ */

$(document).ready(function() {

    if (!checkUser()) return; 

    projectDetails = new ProjectDetails();

    loadProjects(undefined);

    $('.header .menu-item .new-project').on('click', handleNewProject);
    $('.header .search-bar input').on('keyup', handleFindProject);
    $('.header .download').on('click', handleDownloadData);
    $('.header [name="backupFile"]').on('change', handleImportBackup);
    $('.header .btn-options').on('click', handleShowOptions);
});

async function loadProjects() {

    try {

        $('.background-load').addClass('show');
        $('.content-left .project-item').remove();

        const projects = await getProjects(undefined);

        for (let i = 0; i < projects.length; i++) {

            addProjectHTML(projects[i]);
        }

       $('.background-load').removeClass('show');
        
    }
    catch (error) {

        $('.background-load').removeClass('show');

        console.error(error);
        toastError('Failed to perform operation');
    }
}

function addProjectHTML(project) {

    const projectTime = calcTimeProject(project);
    const lastIndex = project.tasks.length - 1;
    const lastTask = project.tasks[lastIndex];

    const $projectItem = $(`
        <div class="project-item" data-id="${project.id}">
            <div class="project-item-details">
                <div class="project-item-top">
                    <span class="project-name">${project.name}</span>
                    <span class="time">${formatTime(projectTime)}</span>
                </div>
                <i class="arrow fas fa-chevron-right"></i>
                <div class="project-item-bottom">
                    <span>${lastTask && lastTask.name ? lastTask.name : ''}</span>
                </div>
            </div>
        </div>
    `);

    $('.content-left').append($projectItem);
    $('.content-left .empty-msg').css('display', 'none');

    $projectItem.on('click', handleShowProjectDetails);
}

function showErrors(errors, $field) {

    $field.html('');
    const vErrors = Object.values(errors);

    for (let i = 0; i < vErrors.length; i++) {

        $field.append(`<span>${vErrors[i]}</span>`);
    }

    $field.addClass('show');

    setTimeout(() => $field.removeClass('show'), 10000);
}

function checkUser() {

    const token = localStorage.getItem('app-token');

    if (!token) {

        window.location.assign('../app/session/index.html');

        return false;
    }

    return true;
}

/* ------------------ HANDLE ------------------ */

function handleNewProject() {

    newProject = new Modal({
        title: 'New Project',
        content: `
            <div class="modal-new-project">
                <form>
                    <div class="new-project-content">
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
                        <div class="row error-field"></div>
                    </div>
                    <div class="row btn-footer">
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

async function handleShowProjectDetails(event) {

    try {

        $('.background-load').addClass('show');

        $('.project-item').removeClass('active');
        $('.arrow').removeClass('fas fa-chevron-left');
        $('.arrow').addClass('fas fa-chevron-right');

        const $projectItem = $(event.currentTarget);
        const id = parseInt($projectItem.attr('data-id'));
        
        const projects = await getProjects(id);

        $projectItem.find('.arrow').removeClass('fas fa-chevron-right');
        $projectItem.find('.arrow').addClass('fas fa-chevron-left');
        $projectItem.addClass('active');

        projectDetails.show(projects[0]);
        $('.btn-delete').addClass('show');

        $('.background-load').removeClass('show');
    }
    catch(error) {
        
        $('.background-load').removeClass('show');

        console.error(error);
        toastError('Failed to perform operation');
    }
}

async function handleCreateProject(event) {

    try {
        event.preventDefault();

        $('.background-load').addClass('show');

        const $modal = $(event.currentTarget).closest('.modal-new-project');
        
        $modal.find('[name="project-name"]').removeClass('error');
        $modal.find('[name="project-name"]').attr('placeholder', '');

        const projectName = $modal.find('[name="project-name"]').val();
        const projectDescription = $modal.find('[name="project-description"]').val();
        const projectPrice = $modal.find('[name="project-price"]').val();
        const estimatedTime = $modal.find('[name="project-estimated-time"]').val();

        const project = {
            name: projectName,
            description: projectDescription,
            price: parseFloat(projectPrice) || 0,
            estimated_time: estimatedTime,
            tasks: []
        };

        const result = await postProject(project);
        if (result.message || result.description || result.estimated_time) {

            $('.background-load').removeClass('show');
            showErrors(result, $('.modal-new-project .error-field'));

            return;
        }

        project.id = result.project_id;
        addProjectHTML(project);

        newProject.hide();
        $('.background-load').removeClass('show');
    }
    catch (error) {

        $('.background-load').removeClass('show');

        console.error(error);
        toastError('Failed to perform operation');
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

// async function handleDownloadData() {
//     try {
//         $('.background-load').addClass('show');
//         const projects = await getProjects(undefined);
//         const jsonProjects = JSON.stringify(projects);
//         const blob = new Blob([jsonProjects], {type: 'text/plan;charset=utf-8'});
//         const url =  URL.createObjectURL(blob);
//         const $link = $(`<a href="${url}" download="ProjectManagerV2_Backup.txt">download</a>`);
//         $link[0].click();
//         $('.background-load').removeClass('show');
//     }
//     catch(error) {
//         $('.background-load').removeClass('show');
//         console.error(error);
//         toastError('Failed to perform operation');
//     }
// }
// function handleImportBackup(event) {
//     const file = event.currentTarget.files[0];
//     const reader = new FileReader();
//     reader.onload = async function() {
//         try {
//             const data = JSON.parse(reader.result);
//             projects = projects.concat(data);
//             await postData(projects);
//             loadProjects();
//             $(event.currentTarget).val(null);
//             toastSucess('Uploaded file');
//         }
//         catch(error) {
//             console.error(error);
//             toastError('Failed to perform operation');
//         }
//     };
//     reader.readAsText(file);
// }