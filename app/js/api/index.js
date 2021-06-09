
const url = 'http://localhost:5001';

async function postProject(project, token) {

    const response = await fetch(url + '/projects', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            autorization: token
        },
        body: JSON.stringify(project)
    });

    return await response.json();
}

async function getProjects(project_id, token) {

    const response = await fetch(url + '/projects/' + (project_id ? project_id : ''), {
        headers: { 
            autorization: token
        }
    });

    return await response.json();
}

async function postTask(task, project_id, token) {

    const response = await fetch(url + '/tasks/' + project_id, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            autorization: token
        },
        body: JSON.stringify(task)
    });

    return await response.json();
}

async function postHistory(action, project_id, task_id, token) {

    const response = await fetch(url + '/history/' + project_id + '/' + task_id, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            autorization: token
        },
        body: JSON.stringify({
            action: action
        })
    });

    return await response.json();
}