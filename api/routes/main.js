
const db = require('../database');
const {getTokenData} = require('../security');

exports.createRouters = (app) => {

    app.post('/projects', async (req, res) => {

        try {
            const project = req.body;

            if (Object.keys(project).length === 0) {

                res.status(422).send({message: 'Falha ao realizar a operação'});
            
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

            res.status(422).send({message: 'Falha ao realizar a operação'});
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
                
                result = await knex.raw(`SELECT tasks.id AS task_id, name, time,
                    history.id AS history_id, action, date
                    FROM tasks 
                    LEFT JOIN history
                    ON history.task_id = tasks.id
                    WHERE project_id = ? AND user_id = ?`,
                [ projectId, userData.user_id ]);

                for (let i = 0; i < result.rows.length; i++) {

                    let task = project.tasks.find((x) => x.id === result.rows[i].task_id);

                    if (!task) {
                        
                        task = {
                            id: result.rows[i].task_id,
                            name: result.rows[i].name,
                            time: result.rows[i].time,
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
                    tasks.id AS task_id, tasks.name AS task_name, time,
                    history.id AS history_id, action, date
                    FROM projects
                    LEFT JOIN tasks
                    ON projects.id = tasks.project_id
                    LEFT JOIN history
                    ON tasks.id = history.task_id
                    WHERE ${condition}
                    ORDER BY projects.name,
                    tasks.id`,
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
                            time: result.rows[i].time,
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
            
            res.status(422).send({message: 'Falha ao realizar a operação'});
        }
    });

    app.post('/tasks/:project_id', async (req, res) => {

        try {
            
            const projectId = parseInt(req.params.project_id);
            const token = req.headers.autorization;
            const userData = getTokenData(token);

            const knex = db.getKnex();

            let result = await knex.raw('INSERT INTO tasks (name, time, project_id, user_id) VALUES (?, ?, ?, ?) RETURNING id',
            [ req.body.name, req.body.time, projectId, userData.user_id ]);

            const task = {
                id: result.rows[0].id,
                name: req.body.name,
                time: req.body.time,
                history: []
            };

            res.send(task);
        }
        catch(error) {

            console.error(error);

            res.status(422).send({ message: 'Falha ao realizar a operação'});
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

                res.status(422).send({message: 'Tafera não encontrada'});

                return;
            }

            const currentDate = new Date().toISOString();

            await knex.raw('INSERT INTO history (action, date, task_id) VALUES (?, ?, ?) RETURNING id',
            [ req.body.action, currentDate, taskId ]);

            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Falha ao realizar a operação'});
        }
    });

    app.post('/data', async (req, res) => {

        try {
            const token = req.headers.autorization;
            const userData = getTokenData(token);

            const knex = db.getKnex();

            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Falha ao realizar a operação'});
        }
    });
}