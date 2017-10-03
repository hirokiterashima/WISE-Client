exports.config = {
    sauceSeleniumAddress: 'localhost:4445/wd/hub',
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    //seleniumAddress: 'http://localhost:4444/wd/hub',

    specs: [
        //'vle/previewProject.spec.js',
        'components/multipleChoice/multipleChoiceRadio.spec.js',
        'components/multipleChoice/multipleChoiceCheckbox.spec.js',
        'components/openResponse/openResponse.spec.js',
        // 'notebook/notebook.spec.js',
        // 'portal/portal.spec.js',
        // 'portal/forgotAccount.spec.js',
        // 'authoringTool/authoringTool.spec.js',
        // 'portal/setUpRun.spec.js',
        // 'classroomMonitor/classroomMonitor.spec.js'
    ],
    multiCapabilities : [
        {
            'browserName': 'chrome',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        }
        /*,
        {
            'browserName': 'firefox',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            'build': process.env.TRAVIS_BUILD_NUMBER
        }
        */
    ]
};

module.exports.config = exports.config;
