
$(document).ready(() => {

    $('.btn-show-modal').on('click', handleShowModal);
    $('.login .forgot-password').on('click', handleShowModalRecovery);
    $('.screen form').submit(handleUserSession);
});

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

    try {
        const $screen = $(event.currentTarget).closest('.screen');
        const $form = $(event.currentTarget);
        const email = $form.find('[name="email"]').val();
        const password = $form.find('[name="password"]').val();

        const user = {
            email: email,
            password: password
        };

        switch ($screen.attr('data-show')) {

            case 'login': {

                const result = await postUserLogin(user);

                if (result) {

                    alert(result.message);

                    return;
                }
                
                window.location.assign('../index.html');

                break;
            }

            case 'register': { 

                const confirmPassword = $form.find('[name="confirm_password"]').val();

                if (user.password !== confirmPassword) {

                    alert('As senhas devem ser iguais');

                    return;
                }

                const result = await postUserRegister(user);

                if (result) {

                    alert(result.message);

                    return;
                }

                alert('Conta registrada com sucesso');

                $screen.attr('data-show', 'login');
                $('.login').find('[name="email"]').val(email);
                $('.login').find('[name="password"]').val(password);

                break;
            }

            case 'recovery': {

                alert('Falha ao realizar a operação');
            }
        }
    }
    catch(error) {

        console.error(error);

        alert('Falha ao realizar a operação');
    }
}
