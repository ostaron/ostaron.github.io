var hide_lists = function(cb) {
    $('#posts').fadeOut(300);
    $('#projects').fadeOut(300);
    $('#about').fadeOut(300);
    $('#about-btn').removeClass('disabled');
    $('#posts-btn').removeClass('disabled');
    $('#projects-btn').removeClass('disabled')
};
var show_projects = function() {
    $('#posts-btn, #about-btn').removeClass('disabled');
    $('#posts, #about').fadeOut(300, function() {
        $('#projects').fadeIn(300)
    });
    $('#projects-btn').addClass('disabled')
};
var show_posts = function() {
    $('#projects-btn, #about-btn').removeClass('disabled');
    $('#about, #projects').fadeOut(function() {
        $('#posts').fadeIn(300)
    });
    $('#posts-btn').addClass('disabled')
};
var show_about = function() {
    $('#projects-btn, #posts-btn').removeClass('disabled');
    $('#posts, #projects').fadeOut(function() {
        $('#about').fadeIn(300)
    });
    $('#about-btn').addClass('disabled')
};
