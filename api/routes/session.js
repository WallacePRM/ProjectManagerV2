
const db = require('../database');
const { generateToken, getTokenData } = require('../security');
const { transporter } = require('./config');
const Crypto = require('crypto-js');

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
                password: Crypto.SHA256(req.body.password).toString()
            };

            let result = await knex.raw('SELECT email FROM users WHERE email = ?', [user.email]);

            if (result.rows.length !== 0) {

                res.status(422).send({message: 'Existing email'});

                return;
            }

            await knex.raw('INSERT INTO users (email, password) VALUES (?, ?)', [user.email, user.password]);
            
            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
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

            user.password = Crypto.SHA256(user.password).toString();

            const result = await knex.raw('SELECT id FROM users WHERE ? = email and ? = password', 
            [user.email.toLowerCase(), user.password]);

            if (result.rows.length === 0) {

                res.status(422).send({message: 'Invalid username or password'});

                return;
            }
        
            const token = generateToken(result.rows[0].id);

            res.send({token});
        }
        catch (error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.post('/session/recovery', async (req, res) => {

        try {

            const email = req.body.email;
            if (!req.body.email) {

                res.status(422).send({message: 'Required email'});

                return;
            }

            const knex = db.getKnex();
            const result = await knex.raw('SELECT id FROM users WHERE email = ?',
            [ email ]);

            if (result.rows.length === 0) {

                res.status(422).send({message: 'invalid email'});

                return;
            }

            const token = generateToken(result.rows[0]);
            const host = 'http://localhost:5500/';
            const mailOptions = {
                from: 'projectmanagerv2.oficial@gmail.com',
                to: email,
                subject: 'Password recovery',
                html: makeTemplate(`${host}session/?recovery=${token}`)
            };

            transporter.sendMail(mailOptions, (error, info) => {

                if (error) {

                    console.log(error);

                    res.status(422).send({message: 'Failed to perform operation'});
                } 
                else {

                    res.send({message: 'Email sent'});
                }
            });
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
        }
    });

    app.post('/session/reset_password', async (req, res) => {

        try {

            let { password, token } = req.body;
            const  {user_id } = getTokenData(token);
            const knex = db.getKnex();

            password = Crypto.SHA256(password).toString();

            await knex.raw('UPDATE users SET password = ? Where id = ?',
            [ password,  user_id.id ]);

            res.send({});
        }
        catch(error) {

            console.error(error);

            res.status(422).send({message: 'Failed to perform operation'});
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
        else if (user.password.length > 50) {

            erros.password = 'Senha deve conter no máximo 30 caracters';
        }
        else if (user.password.length < 6) {

            erros.password = 'Senha deve conter no minimo 6 caracters';
        }

        return erros;
    }

    function makeTemplate(link) {

        return `
        <div>
            <div style="background-color: #23282d; color: #fff; padding: 20px">
                <h1 style="margin: 0;">HI,</h1>
            </div>
            <div style="padding: 20px; font-size: 20px; color: #444;">
                <p style="margin: 0; margin-bottom: 40px;">Click on the button below to reset the password</p>
                <a href="${link}" style="padding: 10px 20px; background-color: #23282d; color: #fff; text-decoration: none;">Go to page</a>
            </div>
        </div>`;
    }
}