// ==UserScript==
// @name                axon
// @namespace           https://github.com/dieuph
// @description         axon
// @author              dieu
// @license             MIT; https://opensource.org/licenses/MIT
// @downloadURL         https://github.com/dieuph/scripting/aa/raw/master/aa.user.js
// @updateURL           https://github.com/dieuph/scripting/aa/raw/master/aa.meta.js
// @supportURL          https://github.com/dieuph/scripting/issues
// @homepageURL         https://github.com/dieuph
// @copyright           2019, dieu (https://github.com/dieuph)
// @include             /^http.?://.*mytime.axonactive.vn.local/workinghour.html*$/
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @grant               GM_getResourceText
// @grant               GM_addStyle
// @grant               GM_setValue
// @grant               GM_getValue
// @version             1.0
// ==/UserScript==

// *************************************************************************
// CONFIGURATION
// *************************************************************************

var inline_src = (<><![CDATA[

    function wait() {
        return new Promise(resolve => { requestAnimationFrame(resolve); });
    }

    async function checkElement(selector) {
        while (document.querySelector(selector) === null) { await wait() }
        return true;
    }

    (function() {
        checkElement('#listmember1_wrapper').then((element) => { initialize(); });
    })();

    var data = {};

    function working() {
        var workingHoursText = $('#total-working-hours').text();
        var workingHours = parseFloat(workingHoursText.substring(workingHoursText.indexOf('rs: ') + 4));
        var missingWorkingHours = 8 - workingHours;
        var missingWorkingMinutes = missingWorkingHours * 60;

        data.workingHours = workingHours;
        data.missingWorkingHours = missingWorkingHours;
        data.missingWorkingMinutes = missingWorkingMinutes;
    }

    function worked() {
        var workedHoursText = $($('#table-block').find('strong')[0]).text();
        var workedDaysText = $($('#table-block').find('strong')[1]).text();

        var workedHours = parseFloat(workedHoursText.substring(workedHoursText.indexOf('is: ') + 4));
        var workedDays = parseFloat(workedDaysText.substring(workedDaysText.indexOf('is: ') + 4));

        var missingWorkedHours = (workedDays * 8) - workedHours;
        var missingWorkedMinutes = missingWorkedHours * 60;

        data.workedHours = workedHours;
        data.workedDays = workedDays;
        data.missingWorkedHours = missingWorkedHours;
        data.missingWorkedMinutes = missingWorkedMinutes;
    }

    function out() {
        var checkout = 'Now or never';
        if (data.missingWorkingMinutes > 0) {
            var currentDate = new Date();
            var m = currentDate.getHours() >= 12 ? 'PM' : 'AM';
            var addTime = (m == 'AM') ? 90.00 : 0.00;
            var calculatedDate = new Date(currentDate.getTime() + (data.missingWorkingMinutes + addTime) * 60000);
            checkout = String(calculatedDate.getHours()).padStart(2, "0") + ":"
                     + String(calculatedDate.getMinutes()).padStart(2, "0") + ":"
                     + String(calculatedDate.getSeconds()).padStart(2, "0");
        }
        data.checkout = checkout;
    }

    function calculate() {
        data = {};

        working();
        worked();
        out();
    }

    const TEMPLATES = {
        text: {
            data: { title: '', value: '' },
            get html() {
                return `<strong class="text-danger">${this.data.title} is: ${this.data.value}</strong><br/>`;
            }
        }
    };

    function render() {
        var panel = $('.container').children().first();
        $(panel).before(`<div class="panel">
            <div class="panel-heading">
                <strong>Analysis</strong>
            </div>
            <div class="panel-body">
                <div id="table-block1" class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                </div>
            </div>
        </div>`);

        TEMPLATES.text.data = { title: 'Working hours', value: data.workingHours.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Missing working hours', value: data.missingWorkingHours.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Missing working minutes', value: data.missingWorkingMinutes.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Time could go home', value: data.checkout };
        $('#table-block1').append(TEMPLATES.text.html);

        $('#table-block1').append('<br>');

        TEMPLATES.text.data = { title: 'Worked hours', value: data.workedHours.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Worked days', value: data.workedDays.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Missing worked hours', value: data.missingWorkedHours.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);

        TEMPLATES.text.data = { title: 'Missing worked minutes', value: data.missingWorkedMinutes.toFixed(2) };
        $('#table-block1').append(TEMPLATES.text.html);
    }

    function reset() {
        $('.text-danger').remove();
        $('#total-working-hours').remove();
        $('#table-block').find('br').remove();
    }

    function initialize() {
        calculate();
        reset();
        render();
    }

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);