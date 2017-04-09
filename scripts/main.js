// Initializes SimpleChat
$(function () {
    // Shortcuts to DOM Elements.
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $userForm = $('#userForm');
    var $userFormArea = $('#userFormArea');
    var $messageArea = $('#messageArea');
    var $users = $('#users');
    var $username = $('#username');
    var $todo = $('#todo');
    // Sets up shortcuts to Firebase features
    var ref = firebase.database().ref();
    var messagesRef = ref.child('messages');
    var usersRef = ref.child('users');
    var userRef;
    var todoRef;


    // Saves username on form submit.
    $userForm.submit(function (e) {
        e.preventDefault();
        if ($username.val()) {
            var Key = usersRef.push({username: $username.val()});
            userRef = usersRef.child(Key.key);
            //Listens for user connection and removes user from database on disconnect
            userRef.onDisconnect().remove();
            todoRef = userRef.child("todo");
            $userFormArea.hide();
            $messageArea.show();

            // Loads to do messages and listens for upcoming ones.
            todoRef.on('child_added', function (snapshot) {
                var val = snapshot.val();
                // Template for to do messages.
                $todo.append('<li id=' + snapshot.key + ' class="list-group-item"><p>' + val.todo +
                    '</p><button class="btn btn-default btn-xs" style="float: block;">' +
                    '<span class="glyphicon glyphicon-pencil"></span></button>' +
                    '<button class="btn btn-default btn-xs" style="float: block;">' +
                    '<span class="glyphicon glyphicon-trash"></span></button>' +
                    '</li>');
                // Function for delete to do button
                $(".btn").has("span[class='glyphicon glyphicon-trash']").unbind().click(function (e) {
                    e.preventDefault();
                    var todoText = $(this).parent().attr('id');
                    todoRef.child(todoText).remove();
                    $("#" + todoText).remove();
                });

                // Function for edit to do button
                $(".btn").has("span[class='glyphicon glyphicon-pencil']").unbind().click(function (e) {
                    e.preventDefault();
                    var oldText= $(this).parent().text();
                    var newText = prompt("Enter your update : ", oldText);
                    if(newText&&oldText!=newText){
                        var todoText = $(this).parent().attr('id');
                    $("#" + todoText).remove();
                    todoRef.child(todoText).child("todo").set(newText);
                }
                });
            });
            // Listens for to do messages edit
            todoRef.on('child_changed', function (snapshot) {
                var val = snapshot.val();
                // Template for to do messages.
                $todo.append('<li id=' + snapshot.key + ' class="list-group-item"><p>' + val.todo +
                    '</p><button class="btn btn-default btn-xs" style="float: block;">' +
                    '<span class="glyphicon glyphicon-pencil"></span></button>' +
                    '<button class="btn btn-default btn-xs" style="float: block;">' +
                    '<span class="glyphicon glyphicon-trash"></span></button>' +
                    '</li>');
                // Function for delete to do button
                $(".btn").has("span[class='glyphicon glyphicon-trash']").unbind().click(function (e) {
                    e.preventDefault();
                    var todoText = $(this).parent().attr('id');
                    todoRef.child(todoText).remove();
                    $("#" + todoText).remove();
                });
                // Function for edit to do button
                $(".btn").has("span[class='glyphicon glyphicon-pencil']").unbind().click(function (e) {
                    var oldText= $(this).parent().text();
                    var newText = prompt("Enter your update : ", oldText);
                    if(newText&&oldText!=newText){
                        var todoText = $(this).parent().attr('id');
                        $("#" + todoText).remove();
                        todoRef.child(todoText).child("todo").set(newText);
                    }
                });

            });
            // Listens for to do messages delete
            todoRef.on('child_removed', function (snapshot) {
               //Delete messege from database
                $("#" + snapshot.key).remove();
            });

        }
    });


    // Saves a new message on the Firebase DB.
    $messageForm.submit(function (e) {
        e.preventDefault();
        // Add a new message entry to the Firebase Database.
        if ($message.val()) {
            messagesRef.push({text: $message.val(), username: $username.val()});
            // Clear message text field
            $message.val('');
        }
    });


    // Loads chat messages history and listens for upcoming ones.
    messagesRef.on('child_added', function (snapshot) {
        var val = snapshot.val();
        // Template messages.
        $chat.append('<div   class="well"><p><strong>' + val.username + ': </strong></p>' + val.text +
            '<button class="btn btn-default btn-xs" style="float: right;">' +
            '<span class="glyphicon glyphicon-file"></span></button>' + '</div>');

        //Function for add message in the to do list
        $(".btn ").has("span[class='glyphicon glyphicon-file']").unbind().click(function (e) {
            e.preventDefault();
            var todoText = $(this).parent().text();
            todoRef.push({todo: todoText});
        });
    });


    // Loads the online users and listens for upcoming ones.
    usersRef.on('child_added', function (snapshot) {
        var userVal = snapshot.val();
        //Online user list template
        $users.append('<li id=' + snapshot.key + ' class="list-group-item">' + userVal.username + '</li>');
    });

    //Listen for offline users and updates the ui
    usersRef.on('child_removed', function (snapshot) {
        $("#" + snapshot.key).remove();
    });

});

