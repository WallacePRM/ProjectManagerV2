
$(document).ready(() => {

    $('.btn-show-modal').on('click', handleShowModal);
    $('.login .forgot-password').on('click', handleShowModalRecovery);
    $('.screen form').submit(handleUserSession);

    checkRecoveryPassword();
});

function showErrors(errors, $field) {

    $field.html('');
    const vErrors = Object.values(errors);

    for (let i = 0; i < vErrors.length; i++) {

        $field.append(`<span>${vErrors[i]}</span>`);
    }

    $field.addClass('show');

    setTimeout(() => $field.removeClass('show'), 10000);
}

function checkRecoveryPassword() {

    const params = new URLSearchParams(location.search);
    const token = params.get('recovery');

    if (token) {

        $('.screen').attr('data-show', 'reset-password');
    }
}

/* ------------------ HANDLE ------------------ */

function handleShowModal(event) {

    const $screen = $(event.currentTarget).closest('.screen');

    if ($screen.attr('data-show') === 'login') {

        $screen.attr('data-show', 'register');
    }
    else if ($screen.attr('data-show') === 'recovery') {

        $screen.attr('data-show', 'login');
    }
    else {
        $screen.attr('data-show', 'login');
    }
}

function handleShowModalRecovery() {

    $('.screen').attr('data-show', 'recovery');
}

async function handleUserSession(event) {

    event.preventDefault();

    $('.background-load').addClass('show');

    const $form = $(event.currentTarget);
    const $field = $form.find('.error-field');

    try {

        const $screen = $(event.currentTarget).closest('.screen');
        $form.find('.error-field').removeClass('show');

        const email = $form.find('[name="email"]').val();
        const password = $form.find('[name="password"]').val();

        const user = {
            email: email,
            password: password
        };

        switch ($screen.attr('data-show')) {

            case 'login': {

                const result = await postUserLogin(user);

                if (result.message || result.password) {

                    showErrors(result, $field);
                    $('.background-load').removeClass('show');

                    return;
                }
                
                saveToken(result.token);
                window.location.assign('../index.html');

                break;
            }

            case 'register': { 

                const confirmPassword = $form.find('[name="confirm_password"]').val();

                if (user.password !== confirmPassword) {

                    showErrors({message: 'Passwords do not match'}, $field);

                    return;
                }

                const result = await postUserRegister(user);

                if (result) {

                    showErrors(result, $field);
                    $('.background-load').removeClass('show');

                    return;
                }

                $screen.find('input').val('');

                toastSucess('Account created successfully');

                $screen.attr('data-show', 'login');
                $('.login').find('[name="email"]').val(email);
                $('.login').find('[name="password"]').val(password);

                break;
            }

            case 'recovery': {

                try {

                    const result = await postUserRecovery(email);

                    if (result.message) {

                        toastError(result.message);
                        $('.background-load').removeClass('show');

                        return;
                    }

                    toastSucess(result.message);

                    $('.background-load').removeClass('show');
                }
                catch(error) {

                    $('.background-load').removeClass('show');

                    console.error(error);
                    toastError('Failed to perform operation');  
                }

                break;
            }
            
            case 'reset-password': {

                const params = new URLSearchParams(location.search);
                const token = params.get('recovery');
                const confirmPassword = $form.find('[name="confirm_password"]').val();

                if (password !== confirmPassword) {

                    showErrors({message: 'Passwords do not match'}, $field);

                    return;
                }

                const result = await postResetPassword(password, token);

                if (result.message) {

                    toastError(result.message);

                    return;
                }

                toastSucess('Password changed successfully');
                $screen.attr('data-show', 'login'); 

                break;
            }
        }

        $('.background-load').removeClass('show');
    }
    catch(error) {

        const errors = checkError(error);

        if (errors.details) {

            showErrors(errors.details, $field);
        }
        else {

            showErrors({message: errors.message}, $field);
        }

        $('.background-load').removeClass('show');
    }
}