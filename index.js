
var projectDetails;
var newProject;

/* ------------------ Functions HANDLE ------------------ */

function handleNewProject() {

    newProject = new Modal({
        title: 'New Project',
        content: `
            <div class="modal-new-project">
                <div class="row">
                    <label>Project name:</label>
                    <input name="project-name" placeholder="ex: news site" type="text">
                </div>
                <div class="row">
                    <label>Project description:</label>
                    <input name="project-description" placeholder="ex: news about: politics, celebrities, entertainment..." type="text">
                </div>
                <div class="row">
                    <label>Project value:</label>
                    <input name="project-price" placeholder="ex: 750" type="number">
                </div>
                <div class="row">
                    <button class="btn btn-primary">Create</button>
                </div>
            </div>
        `
    });

    newProject.show();
    
    $('.modal-new-project .btn').click(handleCreateProject);
}

function handleShowProjectDetails(event) {

    var $projectItem = $(event.currentTarget);
    var i = $projectItem.attr('data-id');
    var i = parseInt(i);
    var project = projects[i];

    projectDetails.show(project);
}

function handleCreateProject() {

    var $modal = $('.modal-new-project');
    var projectName = $modal.find('[name="project-name"]').val();
    var projectDescription = $modal.find('[name="project-description"]').val();
    var projectPrice = $modal.find('[name="project-price"]').val();

    var project = {
        name: projectName,
        description: projectDescription,
        price: projectPrice,
        tasks: []
    };

    var promise = appData.createProject(project);

    promise.then(function() {

        addProjectHTML(project);
        newProject.hide();   
    });

    promise.catch(function(error) {

        showMsg(error);
    });
}

function handleFindProject() {

    var search = $('.header .search-bar input').val();
    var projectList = $('.content-left .project-item').toArray();

    for (var i = 0; i < projectList.length; i++) {

        var projectName = $(projectList[i]).find('.project-name').html();

        if (projectName.indexOf(search) === -1) {
            
            $(projectList[i]).css('display', 'none');
        }
        else {
            $(projectList[i]).css('display', 'flex');
        }
    }
}

function handleDownloadData() {

    var jsonProjects = JSON.stringify(projects);

    var blob = new Blob([jsonProjects], {type: 'text/plan;charset=utf-8'});
    var url =  URL.createObjectURL(blob);

    var $link = $(`<a href="${url}" download="Project_Manager_Backup.txt">download</a>`);

    $link[0].click();
}

function handleImportBackup(event) {

    var file = event.currentTarget.files[0];
    
    var reader = new FileReader();

    reader.onload = function() {

        projects = JSON.parse(reader.result);

        appData.saveData();
        loadProjects();

        $(event.currentTarget).val(null);
    };

    reader.readAsText(file);
}

/* ------------------ Functions ------------------ */

function loadProjects() {

    var promise = appData.getProjects();

    promise.then(function() {

        for (var i = 0; i < projects.length; i++) {

            addProjectHTML(projects[i]);
        }
    });
}

function showMsg(msg) {
    alert(msg);
}

function addProjectHTML(project) {

    var projectTime = calcTimeProject(project);
    var lastIndex = project.tasks.length - 1;
    var lastTask = project.tasks[lastIndex];

    var $projectItem = $(`
        <div class="project-item" data-id="${project.id}">
            <div class="project-item-top">
                <span class="project-name">${project.name}</span>
                <span class="time">${formatTime(projectTime)}</span>
            </div>
            <i class="fa fa-chevron-right"></i>
            <div class="project-item-bottom">
                <span>${lastTask ? lastTask.name : ''}</span>
            </div>
        </div>
    `);

    $('.content-left').append($projectItem);
    $projectItem.click(handleShowProjectDetails);
}


/* ------------------ Initial ------------------ */

$(document).ready(function() {

    projectDetails = new ProjectDetails();

    loadProjects();

    $('.header .menu-item span').click(handleNewProject); 
    $('.header .search-bar input').keyup(handleFindProject);
    $('.header .menus .fa-download').click(handleDownloadData);
    $('.header [name="backupFile"]').change(handleImportBackup);
});