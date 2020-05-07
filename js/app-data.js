
var projects = [];

// projects.push({
//     id: 1,
//     name: '',
//     description: '',
//     price: 0.0,
//     tasks: [{
//         id: 0,
//         name: '',
//         history: [{
//             action: 'play', // pause, stop
//             date: '2020-05-21',
//         }]
//     }]
// })

function AppData() {


    this.saveData = function() {

        var jsonProjects = JSON.stringify(projects);
        localStorage.setItem('appData.projects', jsonProjects);
    }

    function getProjectById(projectId) {

        var currentProject;

            for (var i = 0; i < projects.length; i++) {

                if (projects[i].id === projectId) {
                    currentProject = projects[i];

                    break;
                }
            }

        return currentProject;
    }

    this.getProjects = function() {

        var promise = new Promise(function(resolve, reject) {

            projects = JSON.parse(localStorage.getItem('appData.projects'));
            
            if (projects === null) {
                projects = [];
            }

            resolve();
        });

        return promise;
    };

    this.createProject = function(project) {

        var promise = new Promise(function(resolve, reject) {

            project.id = projects.length;
            projects.push(project);

            this.saveData();
            resolve();
        });

        return promise;
    }

    this.createTask = function(taskName, projectId) {

        var promise = new Promise(function(resolve, reject) {

            var currentProject = getProjectById(projectId);

            if (currentProject) {

                var task = {
                    id: currentProject.tasks.length,
                    name: taskName,
                    history: [{
                        action: 'play',
                        date: new Date().toISOString()
                    }]
                }

                currentProject.tasks.push(task);

                this.saveData();
                resolve(task);
            }
            else {
                reject('Projeto atual não encontrado!');
            }
        });

        return promise;
    }

    this.addTaskHistory = function(action, projectId, taskId) {

        var promise = new Promise(function(resolve, reject) {

            var project = getProjectById(projectId);

            for (var i = 0; i < project.tasks.length; i++) {

                if (project.tasks[i].id === taskId) {
                    currentTask = project.tasks[i];
                }
            }

            currentTask.history.push({
                action: action,
                date: new Date().toISOString()
            });
        
            this.saveData();
            resolve();
        });   

        return promise;
    }
}

var appData = new AppData();