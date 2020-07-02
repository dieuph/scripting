// ==UserScript==
// @name            fintactic
// @namespace       https://github.com/dieuph
// @description     fintactic
// @author          dieu
// @license         MIT; https://opensource.org/licenses/MIT
// @downloadURL     https://github.com/dieuph/scripting/raw/master/fintactic/fintactic.user.js
// @updateURL       https://github.com/dieuph/scripting/raw/master/fintactic/fintactic.meta.js
// @supportURL      https://github.com/dieuph/scripting/issues
// @homepageURL     https://github.com/dieuph
// @copyright       2020, dieu (https://github.com/dieuph)
// @include         /^http.?://.*jira\..*\.com/jira/.*$/
// @include         /^http.?://.*bitbucket\.org/.*$/
// @version         0.1
// ==/UserScript==

console.log('FINTACTIC');

var fragments = {
    buttons: {
        print: `<li><button id="print-link" class="aui-button aui-button-primary aui-style">Print</button></li>`
    }
};

function query() {
    var json = {};
    window.location.search.slice(1).split('&').forEach((query) => {
        query = query.split('=');
        json[query[0]] = decodeURIComponent(query[1] || '');
    });
    return JSON.parse(JSON.stringify(json));
}

(function() {
    if (query().sprint != undefined) {
        $('#create-menu').ready(() => {
            $('#create-menu').parent().append(fragments.buttons.print);
        });
    }
})();