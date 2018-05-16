Feature: First feature

@ignore
Scenario: Simple Login
Given I navigate to 'http://simple_login.mooltipass-tests.com'
When I login to simple login with 'mooltipass'
Then I should be logged in simple login
Given I navigate to 'http://simple_login.mooltipass-tests.com'
Then I should be logged in simple login

@ignore
Scenario: Http Login
Given I navigate to 'http://httpauth.mooltipass-tests.com'
When I login to http login with 'mooltipass'
Then I should be logged in http login
Given I navigate to 'http://httpauth.mooltipass-tests.com'
Then I should be logged in http login

@ignore
Scenario: 2 step Login
Given I navigate to 'http://2-step-login.mooltipass-tests.com/ci/2-step-login/'
When I login to 2 step Login with 'mooltipass'
Then I should be logged in 2 step Login
Given I navigate to 'http://2-step-login.mooltipass-tests.com/ci/2-step-login/'
Then I should be logged in 2 step Login

@ignore
Scenario: Modal Login
Given I navigate to 'http://modal-login.mooltipass-tests.com/ci/modal-login/'
When I go to Modal login page
When I login to Modal Login with 'mooltipass'
Then I should be logged in Modal Login
Given I navigate to 'http://modal-login.mooltipass-tests.com/ci/modal-login/'
When I go to Modal login page
Then I should be logged in Modal Login


Scenario: Etsy Login
Given I navigate to 'http://etsy_login.mooltipass-tests.com/ci/etsy_login/'
When I go to Etsy login page
When I login to Etsy Login with 'mooltipass'
Then I should be logged in Etsy Login
Given I navigate to 'http://etsy_login.mooltipass-tests.com/ci/etsy_login/'
When I go to Etsy login page
Then I should be logged in Etsy Login

#not impelemented yet
#http://chase_login.mooltipass-tests.com/ci/chase_login/