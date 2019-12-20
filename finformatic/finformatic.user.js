// ==UserScript==
// @name                finformatic
// @namespace           https://github.com/dieuph
// @description         finformatic
// @author              dieu
// @license             MIT; https://opensource.org/licenses/MIT
// @homepageURL         https://github.com/dieuph
// @downloadURL         https://github.com/dieuph/scripting/raw/master/finformatic/finformatic.user.js
// @updateURL           https://github.com/dieuph/scripting/raw/master/finformatic/finformatic.meta.js
// @supportURL          https://github.com/dieuph/scripting/issues
// @copyright           2019, dieu (https://github.com/dieuph)
// @include             /^http.?://.*localhost:\d{4}/ivy.*$/
// @include             /^http.?://.*\d{3}.\d{3}.\d{1}.\d{2}:\d{4}/ivy.*$/
// @include             /^http.?://.*desk\.axonivy\.io/.*$/
// @include             /^http.?://.*desk\.finform\.ch/.*$/
// @resource            flyout https://raw.githubusercontent.com/dieuph/finformatic/master/finformatic.min.css
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.2/mousetrap.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/chance/1.0.18/chance.min.js
// @require             https://unpkg.com/micromodal/dist/micromodal.min.js
// @grant               GM_getResourceText
// @grant               GM_addStyle
// @grant               GM_setValue
// @grant               GM_getValue
// @version             1.0
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
                _fillComponents(DATA.cob.accountHolder);
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
                _fillComponents(DATA.cob.beneficialOwner);
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
                _fillComponents(DATA.cob.signingRights);
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
                _fillComponents(DATA.cob.powerOfAttorney);
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
                _fillComponents(DATA.cob.payments);
                _fillComponents(DATA.cob.product);
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
                _fillComponents(DATA.cob.savings);
                _fillComponents(DATA.cob.product);
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
                _fillComponents(DATA.cob.investing);
                _fillComponents(DATA.cob.product);
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
                _fillComponents(DATA.cob.retirement);
                _fillComponents(DATA.cob.product);
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
                _fillComponents(DATA.cob.onlineBanking);
                _fillComponents(DATA.cob.product);
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
                _fillComponents(DATA.quick.accountHolder);
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
        },
        businesses: {
            sob: [
                /^http.?:\/\/.*\/ivy.*\/SelfOnBoarding.xhtml$/gm
            ],
            cob: [
                /^http.?:\/\/.*\/ivy.*\/DataGatheringPage.xhtml$/gm
            ],
            index: [
                /^http.?:\/\/.*\/ivy.*\/index.jsp$/gm
            ],
            all: [
                /^http.?:\/\/.*\/ivy\/.*$/gm
            ]
        },
        banks: {
            individual: [
                /^https?:\/\/.*\/ivy\/faces.*\/Individual\/.*$/gm
            ],
            desk_individual: [
                /^https?:\/\/.*\/ivy\/faces.*\/Desk_Individual\/.*$/gm
            ]
        }
    };

    GM_addStyle(`flyout { font-size: 100% !important; }`);
    GM_addStyle(GM_getResourceText('flyout'));

    const DATA = {
        mandatory: {
            person: {
                get salutation() { return chance.integer({ min: 1, max: 2 }) },
                get first() { return chance.first() },
                get last() { return chance.last() },
                get name() { return chance.name({ middle: true }) },
                get nationality() { return 'CH' },
                get hometown() { return 'Bern' },
                get marital() { return 1 },
                get ahv() { return chance.string({ pool: '1234567890', length: 13 }) }
            },
            address: {
                get street() { return chance.street({ country: 'us' }) },
                get houseNo() { return chance.zip() },
                get zipCode() { return '8000' },
                get city() { return 'Zürich' },
                get mobile() { return '+4178' + chance.phone({ formatted: false }).substring(3) }
            },
            time: {
                options: {
                    year: { min: 1960, max: 2000 }
                },
                year: function(year) {
                    this.options.year = year;
                    return this;
                },
                get date() { return chance.date({ year: chance.year(this.options.year), string: true, american: false }).replace(/\//g, '.') }
            }
        },
        quick: {
            accountHolder: {
                personalInformation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'personFirstName',
                        changed: true,
                        get value() { return DATA.mandatory.person.first; }
                    }, {
                        id: 'personLastName',
                        changed: true,
                        get value() { return DATA.mandatory.person.last; }
                    }, {
                        id: 'personBirthDate_input',
                        changed: true,
                        get value() { return DATA.mandatory.time.year({ min: 1960, max: 2000 }).date; }
                    }]
                }
            }
        },
        cob: {
            accountHolder: {
                personalInformation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'personSalutation_input',
                        changed: true,
                        get value() { return DATA.mandatory.person.salutation }
                    }, {
                        id: 'personFirstName',
                        changed: true,
                        get value() { return DATA.mandatory.person.first; }
                    }, {
                        id: 'personLastName',
                        changed: true,
                        get value() { return DATA.mandatory.person.last; }
                    }, {
                        id: 'homeTown',
                        changed: true,
                        get value() { return DATA.mandatory.person.hometown; }
                    }, {
                        id: 'personBirthDate_input',
                        changed: true,
                        get value() { return DATA.mandatory.time.year({ min: 1960, max: 2000 }).date; }
                    }, {
                        id: 'personMaritalStatus_input',
                        changed: true,
                        get value() { return DATA.mandatory.person.marital; }
                    }, {
                        id: 'addressZipCode',
                        changed: true,
                        get value() { return DATA.mandatory.address.zipCode; }
                    }, {
                        id: 'addressCity',
                        changed: true,
                        get value() { return DATA.mandatory.address.city }
                    }, {
                        id: 'mobilePhoneI18n',
                        changed: true,
                        get value() { return DATA.mandatory.address.mobile; }
                    }]
                },
                secondPersonalInformation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(_app().bank != 'individual'); },
                    fields: [{
                        id: 'addressStreet',
                        changed: true,
                        get value() { return DATA.mandatory.address.street; }
                    }]
                },
                thirdPersonalInformation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return _app().bank == 'individual' ? Promise.resolve(false) : _checkElement('[id$="nokAddressReason_input"]'); },
                    fields: [{
                        id: 'nokAddressReason_input',
                        changed: true,
                        get value() { return chance.integer({ min: 1, max: 3 }); }
                    }]
                },
                occupation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(_app().bank == 'individual'); },
                    fields: [{
                        id: 'occupationType_input',
                        changed: true,
                        get value() { return 1; }
                    }]
                },
                secondOccupation: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return _app().bank == 'individual' ? _checkElement('[id$="profession"]') : Promise.resolve(false); },
                    fields: [{
                        id: 'profession',
                        changed: true,
                        get value() { return chance.profession(); }
                    }, {
                        id: 'industryType_input',
                        changed: true,
                        get value() { return chance.integer({ min: 1, max: 53 }); }
                    }, {
                        id: 'employer',
                        changed: true,
                        get value() { return DATA.mandatory.person.name; }
                    }, {
                        id: 'addressInOccupation:addressStreet',
                        changed: true,
                        get value() { return DATA.mandatory.address.street; }
                    }, {
                        id: 'addressInOccupation:addressZipCode',
                        changed: true,
                        get value() { return DATA.mandatory.address.zipCode; }
                    }, {
                        id: 'addressInOccupation:addressCity',
                        changed: true,
                        get value() { return DATA.mandatory.address.city }
                    }, {
                        id: 'jobStartDate_input',
                        changed: true,
                        get value() { return DATA.mandatory.time.year({ min: 2000, max: 2017 }).date; }
                    }, {
                        id: 'salaryRange_input',
                        changed: true,
                        get value() { return chance.integer({ min: 1, max: 5 }); }
                    }, {
                        id: 'livingCost_input',
                        changed: true,
                        get value() { return chance.integer({ min: 5000, max: 30000 }); }
                    }]
                },
                questionnaire: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: _app().bank == 'individual' ? 'isThirdPersonTheBeneficialOwner' : 'isBeneficialOwner',
                        changed: true,
                        get value() { return 0; }
                    }, {
                        id: 'isHaveAUsCitizen',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'isBornInUS',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'isInPossessionOfUSGreenCard',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'meetTheSubstantialPresenceTest',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'isThereAnyOtherReason',
                        changed: true,
                        get value() { return 1; }
                    }]
                },
                identification: {
                    id: SETTINGS.tabs.accountHolder,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'identificationType_input',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'accountHolderIdentification:identificationNumber',
                        changed: true,
                        get value() { return 'S0004156'; }
                    }, {
                        id: 'accountHolderIdentification:authority',
                        changed: true,
                        get value() { return 'Zurich ZH'; }
                    }, {
                        id: 'accountHolderIdentification:dateOfIssue_input',
                        changed: true,
                        get value() { return '08.08.17'; }
                    }, {
                        id: 'accountHolderIdentification:dateOfExpiry_input',
                        changed: true,
                        get value() { return '10.08.20'; }
                    }]
                }
            },
            beneficialOwner: {
                person: {
                    id: SETTINGS.tabs.beneficialOwner,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'personFirstName',
                        changed: true,
                        get value() { return DATA.mandatory.person.first; }
                    }, {
                        id: 'personLastName',
                        changed: true,
                        get value() { return DATA.mandatory.person.last; }
                    }]
                },
                addressAndContact: {
                    id: SETTINGS.tabs.beneficialOwner,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'addressZipCode',
                        changed: true,
                        get value() { return DATA.mandatory.address.zipCode; }
                    }, {
                        id: 'addressCity',
                        changed: true,
                        get value() { return DATA.mandatory.address.city }
                    }]
                },
            },
            signingRights: {
                signingRights: {
                    id: SETTINGS.tabs.signingRight,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'regulationType',
                        changed: true,
                        get value() { return 0; }
                    }, {
                        id: 'authorisationType',
                        changed: true,
                        get value() { return 1; }
                    }]
                }
            },
            powerOfAttorney: {
                person: {
                    id: SETTINGS.tabs.powerOfAttorney,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'regulationType',
                        changed: true,
                        get value() { return 0; }
                    }, {
                        id: 'authorisationType',
                        changed: true,
                        get value() { return 1; }
                    }, {
                        id: 'dispositionType',
                        changed: true,
                        get value() { return 0; }
                    }, {
                        id: 'dispositionType',
                        changed: true,
                        get value() { return 0; }
                    }, {
                        id: 'personSalutation_input',
                        changed: true,
                        get value() { return DATA.mandatory.person.salutation }
                    }, {
                        id: 'personFirstName',
                        changed: true,
                        get value() { return DATA.mandatory.person.first; }
                    }, {
                        id: 'personLastName',
                        changed: true,
                        get value() { return DATA.mandatory.person.last; }
                    }, {
                        id: 'personBirthDate_input',
                        changed: true,
                        get value() { return DATA.mandatory.time.year({ min: 1960, max: 2000 }).date; }
                    }]
                }
            },
            payments: {
                payments: {
                    id: SETTINGS.tabs.product,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'productCategory_input',
                        changed: true,
                        get value() { return 1; }
                    }]
                }
            },
            savings: {
                savings: {
                    id: SETTINGS.tabs.product,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'productCategory_input',
                        changed: true,
                        get value() { return 2; }
                    }]
                }
            },
            investing: {
                investing: {
                    id: SETTINGS.tabs.product,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'productCategory_input',
                        changed: true,
                        get value() { return 3; }
                    }]
                }
            },
            retirement: {
                retirement: {
                    id: SETTINGS.tabs.product,
                    get fill() { return Promise.resolve(true); },
                    fields: [{
                        id: 'productCategory_input',
                        changed: true,
                        get value() { return 4; }
                    }]
                }
            },
            onlineBanking: {
                onlineBanking: {
                    id: SETTINGS.tabs.product,
                    get fill() { return Promise.resolve(!$('[id*="productTabView"] [id$="productCategory_items"]').find('li').last().hasClass('ui-state-disabled')); },
                    fields: [{
                        id: 'productCategory_input',
                        changed: true,
                        get value() { return 5; }
                    }]
                }
            },
            product: {
                data: {
                    id: SETTINGS.tabs.product,
                    get fill() { return _checkElement('[id$="productType_input"]'); },
                    fields: [{
                        id: 'productType_input',
                        changed: true,
                        get value() { return 1; }
                    }]
                },
                secondData: {
                    id: SETTINGS.tabs.product,
                    get fill() { return _checkElement('[id$="accountName_input"]'); },
                    fields: [{
                        id: 'accountName_input',
                        changed: true,
                        get value() { return 2; }
                    }]
                }
            }
        }
    };

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
        let business = _app().business;
        let renderedButtons = _.filter(BUTTONS, (o) => {
            return o.business && o.business == business || o.business == 'all'
        });
        _.map(renderedButtons, (button, index, buttons) => {
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
    // FORM FILLER
    // *************************************************************************

    function _fillComponents(data) {
        Object.entries(data).forEach(([key, component]) => _fillComponent(component));
    }

    function _fillComponent(component) {
        component.fill.then((fill) => { fill && component.fields.forEach((field, index, fields) => { _fillField(component, field); }) });
    }

    function _fillField(component, field) {
        if (!_.isObject(field)) return;

        field.selector = '[id*="' + component.id + '"] ' + '[id$="' + field.id + '"]';
        let selector = $($(field.selector).get(0));

        if (selector.is('select')) {
            selector.val(_.isNumber(field.value) ? selector.find('option').get(field.value).value : field.value).trigger(field.changed ? 'change' : '');
        }
        if (selector.is('input') || selector.is('textarea')) {
            selector.val(field.value).trigger(field.changed ? 'change' : '');
        }
        if (selector.is('table')) {
            $(selector.find('input').get(field.value)).attr('checked', 'checked').trigger(field.changed ? 'change' : '');
        }
        if (selector.is('div') && field.child) {
            selector.find(field.child).attr('checked', field.value).trigger(field.changed ? 'change' : '');
        }
    }

    // *************************************************************************
    // PRIVATE METHOD
    // *************************************************************************

    function _app() {
        return {
            business: _check(SETTINGS.businesses),
            bank: _check(SETTINGS.banks)
        };
    }

    function _check(patterns) {
        let selector = pattern => {
            let matches = _.filter(pattern, (regex) => { return $(location).attr('href').match(regex); })
            return !_.isEmpty(matches);
        }
        let action = (pattern, patterns) => {
            return (_.invert(patterns))[_.toString(pattern)];
        }
        let detected = _detect(patterns, selector, action);

        return _.isEmpty(detected) ? '' : detected[0];
    }

    function _detect(patterns, selector, action) {
        let detects = [];
        _.each(patterns, (pattern) => {
            if (selector(pattern)) {
                detects.push(action(pattern, patterns));
            }
        });
        return detects;
    }

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

    function _getAccountHolder() {
        let bullets = $('[id$="selectAccountHolder_guiFrmInsideUIRepeat"]');
        let bullet = bullets.map((index, item, list) => {
            let bullet = $(item).find('span');
            if (bullet.hasClass('active')) {
                return bullet;
            }
        }).get(0);

        return  {
            selected: (bullet.hasClass('2') || bullet.hasClass('accountHolder-2')) ? 2 : 1,
            numbers: bullets.length
        }
    }

    function _getPowerOfAttorneys() {
        return $('[id$="selectPowerOfAttorney_guiFrmInsideUIRepeat"]').length;
    }

]]></>).toString(), { presets: [ "es2015", "es2016" ] }).code);