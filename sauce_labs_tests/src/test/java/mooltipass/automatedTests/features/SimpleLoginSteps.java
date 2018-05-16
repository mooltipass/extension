package mooltipass.automatedTests.features;

import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junit.framework.Assert;
import mooltipass.automatedTests.config.WebDriverFactory;
import mooltipass.automatedTests.pageObjects.SimpleLoginPage;

public class SimpleLoginSteps {
	
	SimpleLoginPage simpleLoginPage= new SimpleLoginPage(WebDriverFactory.get());
	
	@When("I login to simple login with '(.*)'")
	public void login(String username){
		simpleLoginPage.enterUsername(username);
		String password ="password";
		simpleLoginPage.enterPassword(password);
		simpleLoginPage.submit();
		
	}
	
	
	@Then("I should be logged in simple login")
	public void checkLogin(){
		Assert.assertTrue("Expected User to be logged in",simpleLoginPage.checkLogin());
	}

}
