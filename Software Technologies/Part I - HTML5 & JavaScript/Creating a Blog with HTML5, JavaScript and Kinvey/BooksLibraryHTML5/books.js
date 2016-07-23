const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_S1TC0D-I";
const kinveyAppSecret = "d648ef87d3f94397a167a1ad9a56608f";

function showView(viewName) {
    //Hide all views and show the selected view
    $('main > section').hide();
    $('#' + viewName).show();
}

function showHideMenuLinks() {
    $("#linkHome").show();
    if (sessionStorage.getItem('authToken') == null) {
        //No logged in user
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkListBooks").hide();
        $("#linkCreateBook").hide();
        $("#linkLogout").hide();
    } else {
        // We have logged in user
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkListBooks").show();
        $("#linkCreateBook").show();
        $("#linkLogout").show();
    }
}

function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () {$('#infoBox').fadeOut()}, 3000);
}

function showError(errorMsg) {
    $('#errorBox').text("ГРЕШКА: " + errorMsg);
    $('#errorBox').show();
}

//Show hide view function
$(function () {
    showHideMenuLinks();
    showView('viewHome');


    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logout);

    // Bind the form submit buttons
    $("#formLogin").submit(function(e) { e.preventDefault(); login(); });
    $("#formRegister").submit(function(e) { e.preventDefault(); register(); });
    $("#formCreateBook").submit(function(e) {e.preventDefault(); createBook(); });



    // Attach Ajax "loading event listener"

    $(document).on({
        ajaxStart: function () {$("#loadingBox").show()},
        ajaxStop: function () {$("#loadingBox").hide()}
    });

})

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
}

// Login function
function login() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $("#loginUser").val(),
        password: $("#loginPass").val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });

    function loginSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        listBooks();
        showInfo('Влязохте успешно.')
    }

}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Не може да влезете поради проблем с мражата.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg);
}


//show registration view
function showRegisterView() {
    showView('viewRegister')
}

function register() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        "Authorization": "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $("#registerUser").val(),
        password: $("#registerPass").val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });

    function registerSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem("authToken", userAuth);
        showHideMenuLinks();
        listBooks();
        showInfo("Потребителя е регистриран успешно.")
    }
}

//implement the “list books” action
function listBooks() {
    $("#books").empty();
    showView('viewBooks');

    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyAuthHeaders = {
        "Authorization": "Kinvey " + sessionStorage.getItem("authToken"),
    };
    $.ajax({
        method: "GET",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        success: loadBooksSuccess,
        error: handleAjaxError
    });

    function loadBooksSuccess(books) {
        showInfo('Книгите са заредени.');
        if (books.length == 0){
            $('#books').text ('Няма книги в библиотеката')
        } else {
            let booksTable = $('<table>')
                .append($('<tr>')
                    .append($('<th>').text('Заглавие'))
                    .append($('<th>').text('Автор'))
                    .append($('<th>').text('Описание'))
                );
            for(let book of books) {
                booksTable.append($('<tr>')
                    .append($('<td>').text(book.title))
                    .append($('<td>').text(book.author))
                    .append($('<td>').text(book.description))


                );

                if(book.comments != undefined) {
                    let parsed = book.comments;
                    let authAndComments = $.parseJSON(parsed);
                    for(c of authAndComments) {
                        booksTable.append($('<tr>')
                            .append($("<td colspan='3' class='commentsClass'>")
                                .append($('<div>').text(c.text))
                                .append ($('<div>').text("    --" + c.author))
                            ));
                    }
                    booksTable.append($('<tr>')
                        .append($("<td colspan='3' class='commentsClass'>")
                            .append ($('<div id="removeDiv">')
                                .append($("<a class='showCommentForm' href='#formHidden' onclick='$(\"#formHidden\").show();$(this).hide();'>[Add comment]</a>"))
                                .append($('<form id="formHidden">' +
                                    'Comment:' +
                                    '<input  id="comment" type="text" required="true" />' +
                                    'Author:' +
                                    ' <input id="author" type="text" required="true" />' +
                                    '<input id="addComment" type="submit" value="Add Comment" />'+
                                    '<input id="Cancel" type="button" value="Cancel" />'+
                                    '</form>'))

                            )

                        ));
                }
            }

            $('#books').append(booksTable);
            let bookData
            $("#formHidden").submit(function(e) {e.preventDefault(); addBookComment(); });
        }



    }

}




function showCreateBookView() {
    showView('viewCreateBook');
}

function createBook() {
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyAuthHeaders = {
        'Authorization' : "Kinvey " + sessionStorage.getItem('authToken'),
    };
    let bookData = {
        title: $('#bookTitle').val(),
        author: $('#bookAuthor').val(),
        description: $('#bookDescription').val()
    };

    $.ajax({
        method:"POST",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        data: bookData,
        success: createBookSuccess,
        error: handleAjaxError
    });

    function createBookSuccess(response){
        listBooks();
        showInfo('Книгата е създадена.');
    }


}


function addBookComment(bookData, commentText, commentAuthor) {
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyHeaders = {
        'Authorization' : "Kinvey " + sessionStorage.getItem('authToken'),
        'Content-type' : 'application/json'

    };

    if(!bookData.comments){
        //No comments still exist -> create and empty array
        bookData.comments = [];

    }
    bookData.comments.push({text: commentText, author: commentAuthor});
    console.log(bookData);
    $.ajax({
        method: "PUT",
        url: kinveyBooksUrl + '/' + bookData._id,
        headers: kinveyHeaders,
        data: JSON.stringify(bookData),
        sucesss: addBookCommentSuccess,
        error: handleAjaxError
    });

    function addBookCommentSuccess(response) {
        listBooks();
        showInfo('Book comment added.')
    }
}




function logout() {
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');
}



