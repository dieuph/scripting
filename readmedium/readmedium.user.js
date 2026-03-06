// ==UserScript==
// @name            open with freedium
// @namespace       https://github.com/dieuph
// @description     readmedium
// @author          dieu
// @license         MIT; https://opensource.org/licenses/MIT
// @downloadURL     https://github.com/dieuph/scripting/raw/master/readmedium/readmedium.user.js
// @updateURL       https://github.com/dieuph/scripting/raw/master/readmedium/readmedium.meta.js
// @supportURL      https://github.com/dieuph/scripting/issues
// @homepageURL     https://github.com/dieuph
// @copyright       2024, dieu (https://github.com/dieuph)
// @include         *
// @version         0.2
// @grant           GM_openInTab
// @run-at          context-menu
// ==/UserScript==

console.log('readmedium');

(function() {
    'use strict';
    var url = "https://freedium-mirror.cfd/" + window.location.href;
    window.open(url, '_self');
})();