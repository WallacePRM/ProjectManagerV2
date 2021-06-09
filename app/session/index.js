
$(document).ready(() => {

    $('.btn-show-modal').on('click', handleShowModal);
    $('.login .forgot-password').on('click', handleShowModalRecovery);
    $('.screen form').submit(handleUserSession);
});

function showErrors(errors, $field) {

    $field.html('');
    const vErrors = Object.values(errors);

    for (let i = 0; i < vErrors.length; i++) {

        $field.append(`<span>${vErrors[i]}</span>`);
    }

    setTimeout(() => $field.addClass('show'), 500);
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

                    return;
                }
                
                saveToken(result.token);
                window.location.assign('../index.html');

                break;
            }

            case 'register': { 

                const confirmPassword = $form.find('[name="confirm_password"]').val();

                if (user.password !== confirmPassword) {

                    showErrors({message: 'As senhas não batem'}, $field);

                    return;
                }

                const result = await postUserRegister(user);

                if (result) {

                    showErrors(result, $field);

                    return;
                }

                $screen.find('input').val('');

                toastSucess('Conta registrada com sucesso');

                $screen.attr('data-show', 'login');
                $('.login').find('[name="email"]').val(email);
                $('.login').find('[name="password"]').val(password);

                break;
            }

            case 'recovery': {

                showErrors({message: 'Email inválido'}, $field);
            }
        }
    }
    catch(error) {

        const errors = checkError(error);

        if (errors.details) {

            showErrors(errors.details, $field);
        }
        else {

            showErrors({message: errors.message}, $field);
        }
    }
}