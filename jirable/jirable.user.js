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
// @include         /^http.?://.*jira\..*\.com/jira/.*$/
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.2/mousetrap.min.js
// @require         https://unpkg.com/axios/dist/axios.min.js
// @version         1.2
// @grant           GM_setClipboard
// ==/UserScript==

eval(Babel.transform((<><![CDATA[
    var TEMPLATE = {
        button: {
            print:
            `<li id="print-menu">
                <a id="print-link" class="aui-button aui-button-primary aui-style print-issue" title="Print issues" href="#" accesskey="p">Print</a>
            </li>`,
            self:
            `<div id="self-check" class="aui-buttons pluggable-ops">
                <a id="self-check-link" title="Self Check" class="aui-button toolbar-trigger viewissue-add-execute" href="#">
                    <span class="trigger-label">Self Check</span>
                </a>
            </div>`,
            cross:
            `<div id="cross-check" class="aui-buttons pluggable-ops">
                <a id="cross-check-link" title="Cross Check" class="aui-button toolbar-trigger viewissue-add-execute" href="#">
                    <span class="trigger-label">Cross Check</span>
                </a>
            </div>`,
            copy:
            `<li style="margin-right:10px">
                <a id="copy-related-issues-link" href="#" class="aui-icon aui-icon-small aui-iconfont-copy issueaction-aui-icon" title="Copy Related Issues">
                    <span>Copy Related Issues</span>
                </a>
            </li>`
        }
    };

    function wait() {
        return new Promise(resolve => { requestAnimationFrame(resolve); });
    }

    async function checkElement(selector) {
        while (document.querySelector(selector) === null) { await wait(); }
        return true;
    }

    class Printer {
        constructor() {
            this.max = 100;
        }

        render() {
            if (this.query().sprint != undefined) {
                $('#create-menu').parent().append(TEMPLATE.button.print);
                $('#print-link').click((e) => { this.print(e); });
            }
        }

        query() {
            var json = {};
            window.location.search.slice(1).split('&').forEach(function(query) {
                query = query.split('=');
                json[query[0]] = decodeURIComponent(query[1] || '');
            });
            return JSON.parse(JSON.stringify(json));
        }

        print(e) {
            e.preventDefault();
            axios({
                method: 'post',
                url: '/jira/rest/api/2/search',
                data: this.payload()
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

        payload() {
            return {
                "jql": "issuetype in standardIssueTypes() AND Sprint = " + (this.query().sprint || '') + " ORDER BY Rank ASC",
                "startAt": 0,
                "maxResults": this.max || 100,
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
    }

    class Button {
        constructor() {
            let key = window.location.pathname.split('/').pop();
            let host = window.location.origin;

            this.issue = axios({
                method: 'get',
                url: host + '/jira/rest/api/2/issue/' + key
            }).then((resolve) => {
                if (resolve.data.fields.issuetype.name != 'Test') {
                    return Promise.reject({});
                }

                return Promise.resolve({
                    id: resolve.data.id,
                    belong: resolve.data.fields.issuelinks[0].inwardIssue.self
                });
            }).then((resolve) => {
                return axios({
                    method: 'get',
                    url: resolve.belong
                }).then((response) => {
                    return Promise.resolve({
                        sprint: /,name=([^,]+)/g.exec(response.data.fields.customfield_10005)[1],
                        id: resolve.id
                    });
                });
            }, (reject) => {
            }).then(function(resolve) {
                return resolve;
            });
        }

        render() {
            this.issue.then((issue) => {
                if (!issue) {
                    return;
                }

                $('#stalker').find('.aui-toolbar2-primary').append(TEMPLATE.button.self).append(TEMPLATE.button.cross);

                let team = issue.sprint.split(' ')[0].toLowerCase();
                let version = issue.sprint.split(' ')[1];
                let id = issue.id;
                let href = '/jira/secure/AddExecute!AddExecute.jspa?id=' + id;

                $('#self-check-link').attr('j-team', team).attr('j-version', version).attr('j-id', id).attr('href', href).on('click', (event) => {
                    this.popup(event);
                });

                $('#cross-check-link').attr('j-team', team).attr('j-version', version).attr('j-id', id).attr('href', href).on('click', (event) => {
                    this.popup(event);
                });
            });
        }

        popup(event) {
            var target = $(event.currentTarget);

            checkElement('#zephyr-je-execute-existing').then((resolve) => {
                $('#zephyr-je-execute-existing').attr('checked', true).trigger('click');
                return resolve;
            }).then((resolve) => {
                let value = $('#project_version').find('option').filter((index, option) => {
                    return $(option).text().toLowerCase() == target.attr('j-team');
                }).first().val();

                $('#project_version').val(value).trigger('change');
                return resolve;
            }).then((resolve) => {
                let value = $('#cycle_names').find('option').filter((index, option) => {
                    let text = $(option).text().toLowerCase();
                    return text.indexOf(target.attr('j-version')) >= 0 && text.indexOf(target.attr('title').toLowerCase()) >= 0;
                }).first().val();

                $('#cycle_names').val(value).trigger('change');
                return resolve;
            }).then((resolve) => {
                //$('#zephyr-je-dlgclose').next().trigger('click');
            });
        }

    }

    class Link {
        constructor() {
        }

        render() {
            $('#linkingmodule_heading').find('ul.ops').prepend(TEMPLATE.button.copy);
            let copy = () => {
                var texts = $('#linkingmodule').find('div.links-container')
                                               .find('dd')
                                               .filter((index, item) => { return $(item).find('img').attr('title').indexOf('Test') >= 0 })
                                               .map((index, item) => { return $(item).find('a').first().text() })
                                               .get()
                                               .join(' ');
                console.log('Copied to clipboard: ' + texts)
                GM_setClipboard(texts)
            }
            $('#copy-related-issues-link').on('click', copy);
            Mousetrap.bind('shift+c', copy);
        }
    }


    (function() {
        checkElement('#create-menu').then((element) => {
            var printer = new Printer();
            printer.render();
        });

        checkElement('#stalker').then((element) => {
            var button = new Button();
            button.render();
        });

        checkElement('#linkingmodule_heading').then((element) => {
            var link = new Link();
            link.render();
        });

    })();

]]></>).toString(), { presets: [ "es2015", "es2016" ] }).code);