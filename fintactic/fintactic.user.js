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
// @version         0.2
// ==/UserScript==

console.log('FINTACTIC');

const fragments = {
    buttons: {
        print: `<li><button id="print-link" class="aui-button aui-button-primary aui-style">Print</button></li>`,
        pr: `<li>
                <dl><dt>
                    <div class="rolling-container sliding-container" style="height: auto;margin-top: 4px;">
                        <div class="rolling-content"><div class="summary-content"><a id="pull-request-link" class="summary" href="#"><span class="count">Create awesome pull request</span></a></div></div>
                    </div>
                </dt></dl>
            </li>`
    },
    dialog: {
        pr: {
            data: {
                records: []
            },
            get html() {
                return `<section id="apr-dialog" class="aui-dialog2" role="dialog" style="width:1000px">
                    <header class="aui-dialog2-header">
                        <h2 class="aui-dialog2-header-main">Create awesome pull request</h2>
                    </header>
                    <div class="aui-dialog2-content">
                        <table class="aui">
                            <thead>
                                <tr>
                                    <th id="apr-select">Select</th>
                                    <th id="apr-branch">Branch</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                                ${this.data.records.map((record) => {
                                    return `<tr>
                                                <td headers="apr-select">
                                                    <div>
                                                        <span><input class="checkbox" type="checkbox" name="${record.name}" id="${record.name}"></span>
                                                    </div>
                                                </td>
                                                <td headers="apr-branch">
                                                    <div>
                                                        <span class="aui-icon aui-icon-small aui-iconfont-devtools-branch-small"></span>
                                                        <a class="branch-link" href="${record.url}" title="${record.name}">${record.name}</a>
                                                    </div>
                                                </td>
                                                
                                            </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                    <footer class="aui-dialog2-footer">
                        <div class="aui-dialog2-footer-actions">
                            <button id="create-apr" class="aui-button aui-button-primary">Create</button>
                            <button id="close-apr" class="aui-button aui-button-link">Close</button>
                        </div>
                        <div class="aui-dialog2-footer-hint"></div>
                    </footer>
                </section>`;
            }
        }
    }
};

const url = {
    detail: `https://jira.axonivy.com/jira/rest/dev-status/1.0/issue/detail?issueId=0&applicationType=bitbucket&dataType=pullrequest`,
    build: `https://build.axonivy.io/view/FINFORM/job/FINFORM_DESK/job/Auto_Create_PR/buildWithParameters?token=B3CKtKCBr8N3rYOg6QrK6Iup6QWNQ8A6&FEATURE_BRANCH=&BUILD_NODE=ecscob&SONAR_JOB=6&CHECK_SONAR=true&CREATE_PULL_REQUEST=true&STORY_ID=`
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
        AJS.$('#create-menu').ready(() => {
            AJS.$('#create-menu').parent().append(fragments.buttons.print);
        });
    }

    $('#devstatus-container').ready(() => {
        var issueId = AJS.$('#key-val').attr('rel');
        if (!issueId) {
            return;
        }
        
        var href = new URL(url.detail);
        href.searchParams.set('issueId', issueId);

        AJS.$.ajax({
            url: href.href
        }).done((data) => {
            console.log(data)
            if (data.detail[0].branches.length > 0) {
                AJS.$('#devstatus-container').append(fragments.buttons.pr);

                AJS.$('#pull-request-link').on('click', () => {
                    AJS.$('#apr-dialog').remove();

                    var pullRequests = data.detail[0].pullRequests.map((pullRequest) => {
                        let repository = new URL(pullRequest.url).pathname.split('/')[2];
                        return {
                            repository: repository,
                            source: pullRequest.source.branch,
                            destination: pullRequest.destination.branch,
                            status: pullRequest.status,
                            url: pullRequest.url
                        }
                    });

                    var template = fragments.dialog.pr;
                    var branches = new Map();
                    data.detail[0].branches.forEach((branch) => {
                        if (!branches.has(branch.name)) {
                            branches.set(branch.name, branch.url);
                        }
                    });
                    var records = [];
                    for (var branch of branches) {
                        records.push({
                            name: branch[0],
                            url: branch[1]
                        });
                    }
                    
                    template.data.records = records;

                    AJS.$('body').append(template.html);
                    AJS.dialog2("#apr-dialog").show();
                    AJS.$('#create-apr').on('click', () => {
                        var href = new URL(url.build);
                        href.searchParams.set('FEATURE_BRANCH', $($('td[headers="apr-select"] input::checked')[0]).attr('name'));
                        href.searchParams.set('STORY_ID', issueId);
                        AJS.$.ajax({url: href.href});
                        
                        AJS.dialog2("#apr-dialog").hide();
                    });
                    AJS.$('#close-apr').on('click', () => { AJS.dialog2("#apr-dialog").hide(); });
                });
            }
        });
    });
})();