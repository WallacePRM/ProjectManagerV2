
const url = 'https://projectmanagerv2.herokuapp.com'; //'http://localhost:5001';

async function postUserRegister(user) {

    const response = await fetch(url + '/session/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    if (response.status !== 200) {

        const data = await response.json();
        const error = createError(data.message || 'Falha ao realizar a operação', data.message ? undefined : data);
    
        throw error;
    }
}

async function postUserLogin(user) {

    const response = await fetch(url + '/session/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    return response.json();
}

async function postUserRecovery(email) {

    const response = await fetch(url + '/session/recovery', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    return response.json();
}

async function postResetPassword(password, token) {

    const response = await fetch(url + '/session/reset_password', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
    });

    return response.json();
}