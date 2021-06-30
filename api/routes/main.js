
const db = require('../database');
const {getTokenData} = require('../security');

exports.createRouters = (app) => {

    app.post('/projects', async (req, res) => {

        try {

            const project = req.body;
            const erros = validateProject(project);
            if (Object.keys(erros).length > 0) {

                res.status(422).send(erros);

                return;
            }

            const knex = db.getKnex();
            const userData = getTokenData(req.headers.autorization);

            const result = await knex.raw('INSERT INTO projects (name, description, estimated_time, price, user_id) VALUES (?, ?, ?, ?, ?) RETURNING id', 
            [ project.name, project.description, project.estimated_time, project.price, userData.user_id]);

            res.send({project_id: result.rows[0].id});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.get('/projects/:id?', async (req, res) => {

        try {

            const projectId = parseInt(req.params.id);
            const token = req.headers.autorization;
            const userData = getTokenData(token);
            const projects = [];

            const knex = db.getKnex();

            if (projectId) {

                let result = await knex.raw('SELECT * FROM projects WHERE id = ? AND user_id = ?',
                [ projectId, userData.user_id ]);
  
                const project = {
                        id: result.rows[0].id,
                        name: result.rows[0].name,
                        description: result.rows[0].description,
                        estimated_time: result.rows[0].estimated_time,
                        price: result.rows[0].price,
                        tasks: []
                };
                
                result = await knex.raw(`SELECT tasks.id AS task_id, name,
                    history.id AS history_id, action, date
                    FROM tasks 
                    LEFT JOIN history
                    ON history.task_id = tasks.id
                    WHERE project_id = ? AND user_id = ?
                    ORDER BY history.date`,
                [ projectId, userData.user_id ]);

                for (let i = 0; i < result.rows.length; i++) {

                    let task = project.tasks.find((x) => x.id === result.rows[i].task_id);

                    if (!task) {
                        
                        task = {
                            id: result.rows[i].task_id,
                            name: result.rows[i].name,
                            history: []
                        };

                        project.tasks.push(task);
                    }

                    if (result.rows[i].history_id) {
                        
                        task.history.push({
                            id: result.rows[i].history_id,
                            action: result.rows[i].action,
                            date: result.rows[i].date.toISOString()
                        });
                    }
                }

                projects.push(project);
            }
            else {

                let condition = '';
                const conditionValue = [];

                if (projectId) {

                    condition = 'projects.id = ? AND ';
                    conditionValue.push(projectId);
                }

                condition += 'projects.user_id = ?';
                conditionValue.push(userData.user_id);

                let result = await knex.raw(`SELECT projects.id AS project_id, projects.name AS project_name, description, estimated_time, price,
                    tasks.id AS task_id, tasks.name AS task_name,
                    history.id AS history_id, action, date
                    FROM projects
                    LEFT JOIN tasks
                    ON projects.id = tasks.project_id
                    LEFT JOIN history
                    ON tasks.id = history.task_id
                    WHERE ${condition}
                    ORDER BY projects.name,
                    tasks.id,
                    history.date`,
                conditionValue );

                for (let i = 0; i < result.rows.length; i++) {

                    let project = projects.find((x) => x.id === result.rows[i].project_id);

                    if (!project) {

                        project = {
                            id: result.rows[i].project_id,
                            name: result.rows[i].project_name,
                            description: result.rows[i].description,
                            estimated_time: result.rows[i].estimated_time,
                            price: result.rows[i].price,
                            tasks: []
                        };

                        projects.push(project);
                    }

                    let task = project.tasks.find((x) => x.id === result.rows[i].task_id);

                    if (!task) {

                        task = {
                            id: result.rows[i].task_id,
                            name: result.rows[i].task_name,
                            history: []
                        };

                        project.tasks.push(task);
                    }

                    if (result.rows[i].history_id) {

                        task.history.push({
                            id: result.rows[i].history_id,
                            action: result.rows[i].action,
                            date: result.rows[i].date.toISOString()
                        });
                    }
                }
            }

            res.send(projects);
        }
        catch(error) {

            console.error(error);
            
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.delete('/projects/:id', async (req, res) => {

        try {

            const projectId = parseInt(req.params.id);
            const token = req.headers.autorization;
            const userData = getTokenData(token);
            
            const knex = db.getKnex();

            const result = await knex.raw('SELECT id FROM tasks WHERE project_id = ? AND user_id = ?',
            [ projectId, userData.user_id ]);

            for (let i = 0; i < result.rows.length; i++) {

                await knex.raw('DELETE FROM history WHERE task_id = ?',
                [ result.rows[i].id ]);
            }

            for (let i = 0; i < result.rows.length; i++) {

                await knex.raw('DELETE FROM tasks WHERE id = ?',
                [ result.rows[i].id ]);
            }

            await knex.raw('DELETE FROM projects WHERE id = ? AND user_id = ?',
                [ projectId, userData.user_id ]);

            res.send({});
        }
        catch(error) {

            console.error(error);
            
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.post('/tasks/:project_id', async (req, res) => {

        try {

            const errors = validateTask(req.body);
            if (Object.keys(errors).length > 0) {

                res.status(422).send(errors);

                return;
            }
            
            const projectId = parseInt(req.params.project_id);
            const token = req.headers.autorization;
            const userData = getTokenData(token);

            const knex = db.getKnex();
            let result = await knex.raw('INSERT INTO tasks (name, project_id, user_id) VALUES (?, ?, ?) RETURNING id',
            [ req.body.name, projectId, userData.user_id ]);

            const task = {
                id: result.rows[0].id,
                name: req.body.name,
                history: []
            };

            res.send(task);
        }
        catch(error) {

            console.error(error);

            res.status(422).send({ message: 'Failed to perform operation'});
        }
    });

    app.post('/history/:project_id/:task_id', async (req, res) => {

        try {

            const projectId = parseInt(req.params.project_id);
            const taskId = parseInt(req.params.task_id);
            const token = req.headers.autorization;
            const userData = getTokenData(token);

            const knex = db.getKnex();

            const result = await knex.raw('SELECT * FROM tasks WHERE id = ? AND project_id = ? AND user_id = ?',
            [ taskId, projectId, userData.user_id ]);

            if (result.rows.length === 0) {

                res.status(422).send({message: 'Task not found'});

                return;
            }

            const currentDate = new Date().toISOString();

            await knex.raw('INSERT INTO history (action, date, task_id) VALUES (?, ?, ?) RETURNING id',
            [ req.body.action, currentDate, taskId ]);

            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    function validateProject(project) {

        const errors = {};

        if (!project) {

            errors.message = 'Informe os dados';

            return errors;
        }
        
        if (!project.name) {

            errors.message = 'Required name';
        }
        else if (project.name.length > 50) {

            errors.message = 'Name must contain a maximum of 50 characters';
        }

        if (project.description.length > 100) {

            errors.description = 'Description must contain a maximum of 100 characters';
        }

        if (project.estimated_time.length > 10) {

            errors.estimated_time = 'Password must contain a maximum of 10 characters';
        }

        return errors;
    }

    function validateTask(task) {

        const errors = {};

        if (!task.name) {

            errors.message = 'Required name';

            return errors;
        }
        else if (task.name.length > 30) {

            errors.message = 'Name must contain a maximum of 30 characters';
        }

        return errors;
    }
}