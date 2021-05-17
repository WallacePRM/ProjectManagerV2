
$(document).ready(() => {

    $('.btn-show-modal').on('click', handleShowModal);
    $('.login .forgot-password').on('click', handleShowModalRecovery);
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

