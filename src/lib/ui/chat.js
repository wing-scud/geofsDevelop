

import ui from './ui'
import geofs from "../geofs"
import multiplayer from "../modules/multiplayer"

var chat = {};
chat.maxNumberMessages = 30;
chat.init = function() {
    $('.geofs-chat-input').keydown((a) => {
        a.which == 27 && chat.hideInput(!0);
    }).mousedown((a) => {
        a.preventDefault();
    });
    $('.geofs-chat-form').submit((a) => {
        multiplayer.setChatMessage($('.geofs-chat-input').val());
        chat.hideInput(!0);
        a.preventDefault();
    });
    $('.geofs-chat-button').mouseup((a) => {
        chat.showInput();
        a.stopPropagation();
    });
    $('.geofs-chat-send-button').mouseup((a) => {
        a.stopPropagation();
    });
    ui.addMouseUpHandler(chat.hideInput);
    let a = $('.geofs-chat-messages'),
        b = $('.geofs-user-block');
    b.data('user', {});
    a.on('click', '.geofs-chat-message .label', function() {
        const a = $(this.parentNode);
        if (a.attr('acid') != geofs.userRecord.id) {
            const d = a.attr('callsign');
            b.find('.geofs-user-callsign').html(d);
            b.data('user', {
                callsign: d,
                uid: a.attr('uid'),
                acid: a.attr('acid'),
            });
            b.show();
        }
    });
    b.on('click', '.geofs-ignore-user', () => {
        const c = b.data('user');
        a.find(`[acid=${c.acid}]`).remove();
        $.ajax(`${geofs.url}/backend/accounts/api.php?action=muteplayer&offenderid=${c.acid}`);
        geofs.userRecord.muteList[c.acid] = 1;
        b.hide();
    });
    b.on('click', '.geofs-ban-user', () => {
        const c = b.data('user');
        a.find(`[acid=${c.acid}]`).addClass('geofs-strikethrough');
        $.ajax(`${geofs.url}/backend/accounts/api.php?action=ban&offenderid=${c.acid}`);
        b.hide();
    });
    b.on('click', '.geofs-cancel', () => {
        b.hide();
    });
};
chat.showInput = function() {
    geofs.preferences.chat == 0 ? ui.notification.show('Chat is disabled. You can enable it in the option panel.') : ($('.geofs-chat-input-section').addClass('geofs-visible'),
        $('.geofs-chat-input').focus());
};
chat.hideInput = function(a) {
    $('.geofs-chat-input-section').removeClass('geofs-visible');
    $('.geofs-chat-input').val('');
    !0 === a && $('.geofs-chat-input').blur();
};
chat.publish = function(a) {
    if (geofs.preferences.chat) {
        const b = decodeURIComponent(a.msg);
        chat.$container = chat.$container || $('.geofs-chat-messages');
        let c = '';
        a.acid == geofs.userRecord.id && (c = 'myself');
        chat.$container.prepend(`<div class="geofs-chat-message ${a.cls}" uid="${a.uid}" acid="${a.acid}" callsign="${a.cs}"><b class="label ${c}">${a.cs}:</b> ${b}</div>`);
        chat.$container.find('.geofs-chat-message').each(function(a) {
            $(this).css('opacity', (chat.maxNumberMessages - a) / chat.maxNumberMessages);
        }).eq(chat.maxNumberMessages).remove();
    }
};
chat.hide = function() {
    $('.geofs-chat-section').hide();
};
chat.show = function() {
    $('.geofs-chat-section').show();
};
export default chat;