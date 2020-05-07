
function Modal(options) {
    
    this.show = function() {
        $('.background-modal').addClass('show');
    };
    
    this.hide = function() {
        $('.background-modal').removeClass('show');
    };

    /* ------------------ Handle ------------------ */

    function handleClose() {
        this.hide();
    }

    /* ------------------ Initial ------------------ */

    var $modal = $('.background-modal .modal');

    $modal.find('.title').html(options.title);
    $modal.find('.modal-body').html(options.content);
    $modal.find('.btn-close').click(handleClose.bind(this));
}

