
const url = 'http://localhost:5001';

async function postUserRegister(user) {

    const response = await fetch(url + '/session/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    if (response.status !== 200) {

        return await response.json();
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

    if (response.status !== 200) {

        return await response.json();
    }
}