﻿/*********************************
  Live Your Life
  Черный список
  Версия: V0.0.3
  Автор: cobaltCorsair
  Дата: 15.12.2020
  Последние изменения: 04.04.2022
*********************************/

function blackList() {
    panel();
    let blockedUsers = getBlockedUsers();
    addButton();

    // создаем панель
    function panel() {
            $('#pun').prepend('<div id="panel">\n' +
            '      <div id="panel-content">\n' +
            '      <ul id="blockUsers"></ul>' +
            '      </div>\n' +
            '      <div id="panel-sticker">\n' +
            '      <span>ЧС</span>\n' +
            '      </div>\n' +
            '      </div>');

            let $panel = $('#panel');
            if ($panel.length) {
                let $sticker = $panel.children('#panel-sticker');
                let showPanel = function() {
                    $panel.animate({
                        left: '+=250',
                    }, 200, function() {
                        $(this).addClass('visible');
                    });
                };
                let hidePanel = function() {
                    $panel.animate({
                        left: '-=250',
                    }, 200, function() {
                        $(this).removeClass('visible');
                    });
                };
                $sticker
                    .children('span').click(function() {
                        if ($panel.hasClass('visible')) {
                            hidePanel();
                        }
                        else {
                            showPanel();
                        }
                    }).andSelf();
            }
    }

    // пишем в хранилище API
    function appendUser(blockedUsers){
        $.post(
            "/api.php",
            {
                    method: "storage.set",
                    token: ForumAPITicket,
                    key: "block_users",
                    value: JSON.stringify(blockedUsers)
            },
            function (json) {
                    getBlockedUsers();
            },
            "json"
        );
    }

    // читаем из хранилища API
    function getBlockedUsers(){
        $.post(
            "/api.php",
            {
                    method: "storage.get",
                    token: ForumAPITicket,
                    key: "block_users"
            },
            function (json) {
                     if (json.response) {
                         let myId = String(UserID);
                         let bUsers = json.response.storage.data["block_users"];
                         bUsers = JSON.parse(bUsers);

                         if (Object.values(bUsers).indexOf(myId) !== -1) {

                             bUsers = Object.fromEntries(Object.entries(bUsers).filter(n => n[1] !== myId));
                             appendUser(bUsers);

                             showUser(myId);
                             toggleQuotes(UserLogin, 0);

                         }

                         if (Object.keys(bUsers).length !== 0) {
                             blockedUsers = bUsers;

                             let blockedUsersID = Object.values(bUsers);
                             hideMessages(blockedUsersID);

                             let blockedUsersNames = Object.keys(bUsers);
                             toggleQuotes(blockedUsersNames, 1);

                             let blockUsers = $("#blockUsers");
                             addInMenu(bUsers, blockUsers);
                             getDelID();
                         }
                         else if (Object.keys(bUsers).length === 0){
                             isEmpty();
                         }
                     }
                     else {
                        isEmpty();
                     }

            },
            "json"
        );

    }

    // если данных нет
    function isEmpty() {
        blockedUsers = {};
        $("#blockUsers").empty();
        $("#blockUsers").append('<p>Пока тут пусто</p>');
    }

    // скрываем пользователей
    function hideMessages(keys) {
    keys.forEach(function(n) {
        $("#pun-main").find(".post[data-user-id='"+ n +"']").each(function() {
            $(this).hide();
        });
    });
    }

    // добавление в меню
    function addInMenu(bUsers, blockUsers) {
        let div = blockUsers;
        $(blockUsers).empty();
        $.each(bUsers, function(key, value){
                div.append('<li class="blockeduser">'+ key +'<strong title="Удалить" data-uid="'+value+'"> × </strong></li>');

    });
    }

    // удаление из меню
    function getDelID() {
        $('#blockUsers > li > strong').click(function() {
        let deletedID = $(this).attr('data-uid');
        let deletedAuthorName = $('#blockUsers > li').text().split(' × ')[0];

        delFromObject(deletedID);
        showUser(deletedID);
        toggleQuotes(deletedAuthorName, 0);
        });
    }

    // удаление из объекта
    function delFromObject(deletedID) {
        for (let key in blockedUsers) {
            if(blockedUsers[key] === deletedID){
                delete blockedUsers[key];
                appendUser(blockedUsers);
            }
        }

    }

    // показываем пользователя
    function showUser(deletedID) {
         $("#pun-main").find(".post[data-user-id='"+ deletedID + "']").show();
    }

    // добавляем кнопку
    function addButton() {
            const button = "<div class=\"blockButton\" alt=\"Добавить в ЧС\" title=\"Добавить в ЧС\"/></div>";

            $("#pun-viewtopic .post:not(.post[data-user-id='"+ UserID +"']) .post-author").each(function() {
                    $(this).wrap("<div class='toBlock'></div>");
                    $(this).after(button);

            });
            getIDAndName();
    }

    // получаем ID блокируемого и его имя
    function getIDAndName() {
        $('.blockButton').click(function() {
        let addedID = $(this).closest('.post').attr('data-user-id');
        let addedNickname = $(this).parent().find(".pa-author > a").html();

        let userArray = [addedID, addedNickname];

        addInObject(userArray);
        appendUser(blockedUsers);

        });
    }

    // добавляем в объект новое имя
    function addInObject(userArray) {
        blockedUsers[userArray[1]] = userArray[0];
    }

    // скрываем цитаты внутри постов
    function toggleQuotes(blockedUsersNames, statusCode) {
        $('.post:visible .quote-box').each(function () {
            let authorName = $(this).text().split(' написал(а):')[0];
            if (blockedUsersNames.indexOf(authorName)!==-1){
                if (statusCode === 1) {
                    $(this).hide()
                }
                else if (statusCode === 0) {
                     $(this).show()
                }
            }
        })}


}

$(document).ready(function() {
if (GroupID !== 3 && GroupID !== 5) {
    blackList();
}});