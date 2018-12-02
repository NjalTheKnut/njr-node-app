$(document).ready(function () {
    $('.deleteUser').on('click', deleteUser);
});

function deleteUser() {
    var confirmation = confirm('Are you sure?');
    var dfd = $.Deferred();
    dfd.done(reloadWindow());

    if (confirmation) {
        $.ajax({
            type: 'DELETE',
            url: '/users/delete/' + $(this).data('id')
        }).then(dfd.resolve(''));
    } else {
        return false;
    }

    function reloadWindow() {
        window.parent.location.replace('/');
        window.parent.location.reload(true);
    }
}