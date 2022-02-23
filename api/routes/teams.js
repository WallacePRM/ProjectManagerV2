const db = require('../database');
const { getTokenData } = require('../security');

exports.createRouters = (app) => {

    app.get('/teams', async (req, res) => {

        try {
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const result = await knex.raw(`
            SELECT m.team_id, t.name, t.user_id AS owner_id, m.user_id AS member_id, u.email AS member_name, tp.project_id, p.name AS project_name,
                    p.user_id AS project_owner_id
            FROM teams AS t
            LEFT JOIN team_members AS m ON t.id = m.team_id
            LEFT JOIN users AS u ON m.user_id = u.id
            LEFT JOIN team_projects AS tp ON t.id = tp.team_id
            LEFT JOIN projects AS p ON tp.project_id = p.id
            WHERE u.id = ? OR t.user_id = ?
            ORDER BY t.name, p.name, u.email`, [userData.user_id, userData.user_id]);

            const teams = mapTeamsDbToModel(result.rows, userData.user_id);
            res.send(teams);
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    /***
     * @param req.body Team
       {
            name: string;
       }
     */
    app.post('/teams', async (req, res) => {

        try {
            const team = req.body;
            const erros = validateTeam(team);
            if (Object.keys(erros).length > 0) {
                res.status(422).send(erros);
                return;
            }

            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const result = await knex.raw(`INSERT INTO teams (name, user_id) VALUES (?, ?) RETURNING id`, [team.name, userData.user_id]);
            const teamCrated = {
                id: result.rows[0].id
            };

            res.send(teamCrated);
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.delete('/teams/:id', async (req, res) => {

        try {
            const id = parseInt(req.params.id);
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            await knex.raw(`DELETE FROM teams WHERE id = ? AND user_id = ?`, [id, userData.user_id]);
            res.send({});
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    /***
     * @param req.body Project
       {
          project_id: number;
       }
    */
    app.post('/teams/:id/projects', async (req, res) => {

        try {
            const team_id = parseInt(req.params.id);
            const { project_id } = req.body;
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const teamResult = await knex.raw(`SELECT user_id FROM teams WHERE id = ?`, [team_id]);
            const projectResult = await knex.raw(`SELECT user_id FROM projects WHERE id = ?`, [project_id]);
            const team = teamResult.rows[0];
            const project = projectResult.rows[0];

            if (team?.user_id !== userData.user_id) {
                res.status(422).send({message: 'You are not the owner of this team'});
                return;
            }

            if (project?.user_id !== userData.user_id) {
                res.status(422).send({message: 'You are not the owner of this project'});
                return;
            }

            await knex.raw(`INSERT INTO team_projects (team_id, project_id) VALUES (?, ?)`, [team_id, project_id]);
            res.send({
                team_id,
                project_id
            });
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.delete('/teams/:team_id/projects/:project_id', async (req, res) => {

        try {
            const { team_id, project_id } = req.params;
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const teamResult = await knex.raw(`SELECT user_id FROM teams WHERE id = ?`, [team_id]);
            const team = teamResult.rows[0];

            if (team?.user_id !== userData.user_id) {
                res.status(422).send({message: 'You are not the owner of this team'});
                return;
            }

            await knex.raw('DELETE FROM team_projects WHERE team_id = ? AND project_id = ?', [team_id, project_id]);
            res.send({});
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.post('/teams/:id/members', async (req, res) => {

        try {
            const team_id = parseInt(req.params.id);
            const { member_id } = req.body;
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const teamResult = await knex.raw(`SELECT user_id FROM teams WHERE id = ?`, [team_id]);
            const team = teamResult.rows[0];

            if (team?.user_id !== userData.user_id) {
                res.status(422).send({message: 'You are not the owner of this team'});
                return;
            }

            await knex.raw(`INSERT INTO team_members (team_id, user_id) VALUES (?, ?)`, [team_id, member_id]);
            res.send({
                team_id,
                member_id
            });
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.delete('/teams/:team_id/members/:member_id', async (req, res) => {

        try {
            const { team_id, member_id } = req.params;
            const token = req.headers.Authorization;
            const userData = getTokenData(token);
            const knex = db.getKnex();

            const teamResult = await knex.raw(`SELECT user_id FROM teams WHERE id = ?`, [team_id]);
            const team = teamResult.rows[0];

            if (team?.user_id !== userData.user_id) {
                res.status(422).send({message: 'You are not the owner of this team'});
                return;
            }

            await knex.raw('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, member_id]);
            res.send({});
        }
        catch(error) {
            console.error(error);
            res.status(422).send({message: 'Failed to perform operation'});
        }
    });
};

function mapTeamsDbToModel(teamsDb, user_id) {

    const teams = [];
    const teamsIndex = {};
    const membersIndex = {};
    const projecsIndex = {};

    for(const teamDb of teamsDb) {

        let team = teamsIndex[teamDb.team_id];
        if(!team) {
            team = {
                id: teamDb.team_id,
                name: teamDb.name,
                isOwner: teamDb.owner_id === user_id,
                members: [],
                projects: []
            };
            teams.push(team);
            teamsIndex[teamDb.team_id] = team;
        }

        if (teamDb.member_id && !membersIndex[teamDb.id + '' + teamDb.member_id]) {

            team.members.push({
                id: teamDb.member_id,
                name: teamDb.member_name
            });

            membersIndex[teamDb.id + '' + teamDb.member_id] = true;
        }

        if (teamDb.project_id && !projecsIndex[teamDb.id + '' + teamDb.project_id]) {

            team.projects.push({
                id: teamDb.project_id,
                name: teamDb.project_name,
                isOwner: teamDb.project_owner_id === user_id
            });

            projecsIndex[teamDb.id + '' + teamDb.project_id] = true;
        }
    }

    return teams;
}

function validateTeam(team) {

    const errors = {};

    if (!team) {
        errors.message = 'Informe os dados';
        return errors;
    }

    if (!team.name) {
        errors.message = 'Required name';
    }
    else if (team.name.length > 60) {
        errors.message = 'Name must contain a maximum of 60 characters';
    }

    return errors;
}