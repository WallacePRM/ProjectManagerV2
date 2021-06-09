
const db = require('../database');
const {generateToken} = require('../security');

exports.createRouters = (app) => {

    app.post('/session/register', async (req, res) => {

        try {
            const erros = validateUser(req.body);
            if (Object.keys(erros).length > 0) {

                res.status(422).send(erros);

                return;
            }

            const knex = db.getKnex();

            const user = {
                email: req.body.email,
                password: req.body.password,
            };

            let result = await knex.raw('SELECT email FROM users WHERE email = ?', [user.email]);

            if (result.rows.length !== 0) {

                res.status(422).send({message: 'Email existente'});

                return;
            }

            await knex.raw('INSERT INTO users (email, password) VALUES (?, ?)', [user.email, user.password]);
            
            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Falha ao realizar a operação'});
        }
    });

    app.post('/session/login', async (req, res) => {

        try {
            const knex = db.getKnex();
            const user = req.body;

            const erros = validateUser(user);
            if (Object.keys(erros).length > 0) {

                res.status(422).send(erros);

                return;
            }

            const result = await knex.raw('SELECT id FROM users WHERE ? = email and ? = password', 
            [user.email.toLowerCase(), user.password]);

            if (result.rows.length === 0) {

                res.status(422).send({message: 'Usuário ou senha inválido'});

                return;
            }
        
            const token = generateToken(result.rows[0].id);

            res.send({token});
        }
        catch (error) {

            console.error(error);

            res.status(422).send({message: 'Falha ao realizar a operação'});
        }
    });

    function validateUser(user) {

        const erros = {};

        if (!user) {

            erros.message = 'Informe os dados';

            return erros;
        }
        
        if (!user.email) {

            erros.email = 'Email obrigatório';
        }
        else if (user.email.length > 50) {

            erros.email = 'email deve conter no máximo 50 caracters';
        }

        if (!user.password) {

            erros.password = 'Senha obrigatório';
        }
        else if (user.password.length > 30) {

            erros.password = 'Senha deve conter no máximo 30 caracters';
        }
        else if (user.password.length < 6) {

            erros.password = 'Senha deve conter no minimo 6 caracters';
        }

        return erros;
    }
}