$(document).ready(function() {var formatter = new CucumberHTML.DOMFormatter($('.cucumber-report'));formatter.uri("mooltipass/automatedTests/features/Tests.feature");
formatter.feature({
  "line": 1,
  "name": "First feature",
  "description": "",
  "id": "first-feature",
  "keyword": "Feature"
});
formatter.before({
  "duration": 4233739164,
  "status": "passed"
});
formatter.scenario({
  "line": 38,
  "name": "Etsy Login",
  "description": "",
  "id": "first-feature;etsy-login",
  "type": "scenario",
  "keyword": "Scenario"
});
formatter.step({
  "line": 39,
  "name": "I navigate to \u0027http://etsy_login.mooltipass-tests.com/ci/etsy_login/\u0027",
  "keyword": "Given "
});
formatter.step({
  "line": 40,
  "name": "I go to Etsy login page",
  "keyword": "When "
});
formatter.step({
  "line": 41,
  "name": "I login to Etsy Login with \u0027mooltipass\u0027",
  "keyword": "When "
});
formatter.step({
  "line": 42,
  "name": "I should be logged in Etsy Login",
  "keyword": "Then "
});
formatter.step({
  "line": 43,
  "name": "I navigate to \u0027http://etsy_login.mooltipass-tests.com/ci/etsy_login/\u0027",
  "keyword": "Given "
});
formatter.step({
  "line": 44,
  "name": "I go to Etsy login page",
  "keyword": "When "
});
formatter.step({
  "line": 45,
  "name": "I should be logged in Etsy Login",
  "keyword": "Then "
});
formatter.match({
  "arguments": [
    {
      "val": "http://etsy_login.mooltipass-tests.com/ci/etsy_login/",
      "offset": 15
    }
  ],
  "location": "GitHubSteps.navigateToURL(String)"
});
formatter.result({
  "duration": 3857461903,
  "status": "passed"
});
formatter.match({
  "location": "EtsySteps.goTologinPage()"
});
formatter.result({
  "duration": 1646419421,
  "status": "passed"
});
formatter.match({
  "arguments": [
    {
      "val": "mooltipass",
      "offset": 28
    }
  ],
  "location": "EtsySteps.login(String)"
});
formatter.result({
  "duration": 538083502,
  "status": "passed"
});
formatter.match({
  "location": "EtsySteps.checkLogin()"
});
formatter.result({
  "duration": 83899409,
  "status": "passed"
});
formatter.match({
  "arguments": [
    {
      "val": "http://etsy_login.mooltipass-tests.com/ci/etsy_login/",
      "offset": 15
    }
  ],
  "location": "GitHubSteps.navigateToURL(String)"
});
formatter.result({
  "duration": 3278978917,
  "status": "passed"
});
formatter.match({
  "location": "EtsySteps.goTologinPage()"
});
formatter.result({
  "duration": 1614246643,
  "status": "passed"
});
formatter.match({
  "location": "EtsySteps.checkLogin()"
});
formatter.result({
  "duration": 1834471764,
  "status": "passed"
});
formatter.after({
  "duration": 141366615,
  "status": "passed"
});
});