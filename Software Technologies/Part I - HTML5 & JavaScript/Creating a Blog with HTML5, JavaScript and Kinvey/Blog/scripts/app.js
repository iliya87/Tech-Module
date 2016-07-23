(function () {
    let baseUrl = "https://baas.kinvey.com";
    let appKey = "kid_rJX5Shg_";
    let appSecret = "2f2a219271694339bef43b63fd09e3b6";
    var _guestCredentials = "8f735ffa-a3f0-4997-804c-dd209294e0a8.K7LLHgEHYQ0IKG+E6fptzfZHjaqdNt5zNLCehfNrqUM=";

    let authService = new AuthorizationService(
        baseUrl,
        appKey,
        appSecret,
        _guestCredentials
    );
    authService.initAuthorizationType("Kinvey");
    let requester = new Requester(authService);

    let selector = ".wrapper";
    let mainContentSelector = ".main-content";

    let homeView = new HomeView(selector, mainContentSelector);
    let homeController = new HomeController(homeView, requester, baseUrl, appKey);

    let userView = new UserView(selector, mainContentSelector);
    let userController = new UserController(userView, requester, baseUrl, appKey);
    
    let postView = new PostView(selector, mainContentSelector);
    let postController = new PostController(postView, requester, baseUrl, appKey);

    initEventServices();

    onRoute("#/",
        function () {
        if (authService.isLoggedIn()){
            homeController.showUserPage();
        }
        else{
            homeController.showGuestPage();
        }
    });

    onRoute("#/post-:id", function () {
       let top = $("#post-" + this.params['id'])
           .position().top;
        $(window).scrollTop(top);
    });

    onRoute("#/login", function () {
        userController.showLoginPage(authService.isLoggedIn());
    });

    onRoute("#/register", function () {
        userController.showRegisterPage(authService.isLoggedIn());
    });

    onRoute("#/logout", function () {
        userController.logout();
    });

    onRoute('#/posts/create', function () {
        let data ={
            fullName: sessionStorage['fullName']
        };
        postController.showCreatePostPage(data, authService.isLoggedIn());
    });

    bindEventHandler('login', function (ev, data) {
        userController.login(data);
    });

    bindEventHandler('register', function (ev, data) {
        userController.register(data);
    });

    bindEventHandler('createPost', function (ev, data) {
        postController.createNewPost(data);
    });

    run('#/');
})();
