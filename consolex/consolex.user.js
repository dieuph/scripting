// ==UserScript==
// @name            consolex
// @namespace       https://github.com/dieuph
// @description     consolex
// @author          dieu
// @license         MIT; https://opensource.org/licenses/MIT
// @downloadURL     https://github.com/dieuph/scripting/raw/master/consolex/consolex.user.js
// @updateURL       https://github.com/dieuph/scripting/raw/master/consolex/consolex.meta.js
// @supportURL      https://github.com/dieuph/scripting/issues
// @homepageURL     https://github.com/dieuph
// @copyright       2019, dieu (https://github.com/dieuph)
// @match           https://*/*
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.5/mousetrap.min.js
// @resource        flyout https://raw.githubusercontent.com/dieuph/scripting/master/consolex/consolex.css
// @require         https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js
// @require         https://unpkg.com/micromodal/dist/micromodal.min.js

// @version         1.0
// @grant           GM_getResourceText
// @grant           GM_addStyle
// @grant           GM_setValue
// @grant           GM_getValue
// @icon            <$ICON$>
// @noframes
// ==/UserScript==

eval(Babel.transform((<><![CDATA[

    // *************************************************************************
    // CONFIGURATION
    // *************************************************************************
    const KEYS = {
        panel: {
            flyout: 'panel-flyout'
        }
    };

    const TEMPLATES = {
        panel: {
            flyout: {
                data: {
                    toggle: GM_getValue(KEYS.panel.flyout) == 'open' ? 'toggle-open' : '',
                    panel: GM_getValue(KEYS.panel.flyout) == 'open' ? 'panel-open' : ''
                },
                get html() {
                    _.isEmpty(GM_getValue(KEYS.panel.flyout)) && GM_setValue(KEYS.panel.flyout, 'open');
                    $('#panelFlyout').attr('aria-hidden', 'true');
                    return `
                    <div class="flyout">
                        <button type="button" id="toggleFlyout" class="button-toggle ${this.data.toggle}">
                            <span class="line"></span>
                            <span class="line"></span>
                            <span class="line"></span>
                            <span class="vis-hide">menu</span>
                        </button>
                        <div id="panelFlyout" class="panel-flyout panel-flyout-right ${this.data.panel}">
                            <div class="panel-flyout-inner">
                            </div>
                        </div>
                    </div>
                    `;
                },
                toggle: (e) => {
                    e.preventDefault();
                    let toggle = GM_getValue(KEYS.panel.flyout) == 'open';
                    let status = toggle ? 'close' : 'open';
                    GM_setValue(KEYS.panel.flyout, status);
                    $('#toggleFlyout').toggleClass('toggle-open');
                    $('#panelFlyout').toggleClass('panel-open');
                    $('#panelFlyout').attr('aria-hidden', $('#panelFlyout').attr('aria-hidden') == 'true' ? 'false' : 'true');
                }
            },
            help: {
                data: {},
                get html() {
                    return `
                    <div class="modal micromodal-slide" id="modal-1" aria-hidden="true">
                        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                            <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                                <header class="modal__header">
                                    <h2 class="modal__title" id="modal-1-title">Help</h2>
                                    <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                                </header>
                                <main class="modal__content" id="modal-1-content">
                                    <p>
                                    <code>ALT + \`</code> Open app panel </br>
                                    <code>ALT + 1</code> Open user help modal </br>
                                    <code>ALT + Q</code> Quick fill </br>
                                    <code>CTRL + SHIFT + 1</code> Full fill Account Holder </br>
                                    <code>CTRL + SHIFT + 2</code> Full fill Correspondence </br>
                                    <code>CTRL + SHIFT + 3</code> Full fill Beneficial Owner </br>
                                    <code>CTRL + SHIFT + 4</code> Full fill Signing Rights </br>
                                    <code>CTRL + SHIFT + 5</code> Full fill Power Of Attorney </br>
                                    <code>ALT + SHIFT + 1</code> Full fill Payments </br>
                                    <code>ALT + SHIFT + 2</code> Full fill Savings </br>
                                    <code>ALT + SHIFT + 3</code> Full fill Investing </br>
                                    <code>ALT + SHIFT + 4</code> Full fill Retirement </br>
                                    <code>ALT + SHIFT + 5</code> Full fill Online Banking </br>
                                    </p>
                                </main>
                                <footer class="modal__footer">
                                </footer>
                            </div>
                        </div>
                    </div>
                    `;
                },
                toggle: (e) => {
                }
            }
        },
        buttons: {
            normal: {
                data: { id: '', text: '' },
                get html() {
                    return `
                    <div class="button-container">
                        <a id="${this.data.id}" href="#" class="button">${this.data.text}</a>
                    </div>
                    `;
                }
            }
        }
    };

    const BUTTONS = {
        panel: {
            display: false,
            id: 'panel',
            text: '',
            shortcut: 'alt+\`',
            business: 'all',
            event: (e) => {
                e.preventDefault();
                $('#toggleFlyout').click();
            }
        },
        help: {
            display: false,
            id: 'help',
            text: '',
            shortcut: 'alt+1',
            business: 'all',
            event: (e) => {
                e.preventDefault();
                MicroModal.show('modal-1');
            }
        },
        accountHolder: {
            display: true,
            id: 'accountHolder',
            text: 'Account Holder',
            shortcut: "ctrl+shift+1",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        correspondence: {
            display: true,
            id: 'correspondence',
            text: 'Correspondence',
            shortcut: "ctrl+shift+2",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        beneficialOwner: {
            display: true,
            id: 'beneficialOwner',
            text: 'Beneficial Owner',
            shortcut: "ctrl+shift+3",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        signingRights: {
            display: true,
            id: 'signingRights',
            text: 'Signing Rights',
            shortcut: "ctrl+shift+4",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        powerOfAttorney: {
            display: true,
            id: 'powerOfAttorney',
            text: 'Power Of Attorney',
            shortcut: "ctrl+shift+5",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        payments: {
            display: false,
            id: 'payments',
            text: '',
            shortcut: "alt+shift+1",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        savings: {
            display: false,
            id: 'savings',
            text: '',
            shortcut: "alt+shift+2",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        investing: {
            display: false,
            id: 'investing',
            text: '',
            shortcut: "alt+shift+3",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        retirement: {
            display: false,
            id: 'retirement',
            text: '',
            shortcut: "alt+shift+4",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        onlineBanking: {
            display: false,
            id: 'onlineBanking',
            text: '',
            shortcut: "alt+shift+5",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        },
        quickFill: {
            display: false,
            id: 'quickFill',
            text: '',
            shortcut: "alt+q",
            business: 'cob',
            event: (e) => {
                e.preventDefault();
            }
        }
    };

    const SETTINGS = {
        tabs: {
            accountHolder: 'accountHolderTabView',
            beneficialOwner: 'beneficialOwnerTabView',
            signingRight: 'signingRightTabView',
            powerOfAttorney: 'powerOfAttorneyTabView',
            product: 'productTabView'
        }
    };

    GM_addStyle(`flyout { font-size: 100% !important; }`);
    GM_addStyle(GM_getResourceText('flyout'));


    // *************************************************************************
    // APPLICATION INITIALIZE
    // *************************************************************************
    (function() {
        createApplication();
    })();

    function createApplication() {
        createPanels();
        createButtons();
    }

    function createPanels() {
        let flyout = TEMPLATES.panel.flyout;
        $('body').after(flyout.html);
        $('#toggleFlyout').on('click', flyout.toggle);

        let help = TEMPLATES.panel.help;
        $('body').after(help.html);
    }

    function createButtons() {
        _.map(BUTTONS, (button, index, buttons) => {
            createButton(button);
        });
    }

    function createButton(button) {
        if (button.display == true) {
            let template = TEMPLATES.buttons[button.template || 'normal'];
            template.data = button;
            $('.panel-flyout-inner').append(template.html);
            $("#" + button.id).click(button.event);
        }

        button.shortcut && Mousetrap.bind(button.shortcut, button.event);
    }

    // *************************************************************************
    // PRIVATE METHOD
    // *************************************************************************

    function _waiter() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        });
    }

    async function _checkElement(selector) {
        while (document.querySelector(selector) === null) {
            await _waiter();
        }
        return true;
    }


]]></>).toString(), { presets: [ "es2015", "es2016" ] }).code);