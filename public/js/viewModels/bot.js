/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * bot module
 */
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function botContentViewModel() {
        var self = this;


        self.handleAttached = function () {
            console.log(document.getElementById('chatbot'))
            const params = BotChat.queryParams(location.search);

            const user = {
                id: params['userid'] || 'userid',
                name: params['username'] || 'username'
            };

            const bot = {
                id: params['botid'] || 'botid',
                name: params['botname'] || 'botname'
            };

            window['botchatDebug'] = params['debug'] && params['debug'] === 'true';

            BotChat.App({
                bot: bot,
                locale: params['locale'],
//                resize: 'detect',
                // sendTyping: true,    // defaults to false. set to true to send 'typing' activities to bot (and other users) when user is typing
                user: user,
                // locale: 'es-es', // override locale to Spanish

                directLine: {
                    domain: params['domain'],
                    secret: 'yJ37-dzlHKg.cwA.qgc.OjOx1YL0dUbncElB2-PeZ_BiyNDWxWqpGjC3s_LuSLw',
                    token: params['t'],
                    webSocket: params['webSocket'] && params['webSocket'] === 'true' // defaults to true
                }
            }, document.getElementById('chatbot'));
        }
    }

    return botContentViewModel;
});
