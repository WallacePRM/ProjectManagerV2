

function createError(msg, details) {

    return {
        message: msg,
        details: details,
        appError: true
    };
}

function checkError(error) {

    if (error.appError) {

        return error;
    }
    else {

        console.error(error);

        return createError('Falha ao realizar a operação');
    }
}

function saveToken(token) {

    localStorage.setItem('app-token', token);
}

function getToken() {

    return localStorage.getItem('app-token');
}