// ==UserScript==
// @name            jirable
// @namespace       https://github.com/dieuph
// @description     jirable
// @author          dieu
// @license         MIT; https://opensource.org/licenses/MIT
// @downloadURL     https://github.com/dieuph/scripting/raw/master/jirable/jirable.user.js
// @updateURL       https://github.com/dieuph/scripting/raw/master/jirable/jirable.meta.js
// @supportURL      https://github.com/dieuph/scripting/issues
// @homepageURL     https://github.com/dieuph
// @copyright       2019, dieu (https://github.com/dieuph)
// @include         /^http.?://.*jira\..*\.com/jira/secure/RapidBoard.jspa.*$/
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require         https://unpkg.com/axios/dist/axios.min.js
// @version         1.1
// ==/UserScript==

eval(Babel.transform((<><![CDATA[
    function wait() {
        return new Promise(resolve => { requestAnimationFrame(resolve); });
    }

    async function checkElement(selector) {
        while (document.querySelector(selector) === null) { await wait() }
        return true;
    }

    function initialization() {
        if (query().sprint == undefined) {
            return;
        }
        $('#create-menu').parent().append(`<li id="print-menu"><a id="print_link" class="aui-button aui-button-primary aui-style print-issue" title="Print issues" href="#" accesskey="p">Print</a></li>`);
        $('#print_link').click((e) => { print(e); });
    }

    (function() {
        checkElement('#create-menu').then((element) => { initialization(); });
    })();

    function print(e) {
        e.preventDefault();
        axios({
            method: 'post',
            url: '/jira/rest/api/2/search',
            data: payload(query().sprint, 100)
        }).then(function(result) {
            axios({
                method: 'get',
                url: 'https://raw.githubusercontent.com/dieuph/scripting/master/jirable/print.html'
            }).then(function(template) {
                var win = window.open("", "_blank");
                win.data = result.data;
                win.document.write(template.data);
            });
        });
    }

    function payload(sprint, max) {
        return {
            "jql": "issuetype in standardIssueTypes() AND Sprint = " + (sprint || '') + " ORDER BY Rank ASC",
            "startAt": 0,
            "maxResults": max || 100,
            "fields": [
                "priority",
                "issuetype",
                "summary",
                "assignee",
                "subtasks",
                "customfield_10002",
                "status"
            ]
        }
    }

    function query() {
        var json = {};
        window.location.search.slice(1).split('&').forEach(function(query) {
            query = query.split('=');
            json[query[0]] = decodeURIComponent(query[1] || '');
        });
        return JSON.parse(JSON.stringify(json));
    }

]]></>).toString(), { presets: [ "es2015", "es2016" ] }).code);