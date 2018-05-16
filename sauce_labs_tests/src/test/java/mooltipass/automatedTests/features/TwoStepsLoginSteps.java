package mooltipass.automatedTests.features;

import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junit.framework.Assert;
import mooltipass.automatedTests.config.WebDriverFactory;
import mooltipass.automatedTests.pageObjects.TwoStepLoginPage;

public class TwoStepsLoginSteps {

	TwoStepLoginPage twoStepLoginPage= new TwoStepLoginPage(WebDriverFactory.get());
	
	@When("I login to 2 step Login with '(.*)'")
	public void login(String username){
		
		twoStepLoginPage.enterUsername(username);
		twoStepLoginPage.clickNext();
		String password ="password";
		twoStepLoginPage.enterPassword(password);
		twoStepLoginPage.submit();
	
		
	}
	
	
	@Then("I should be logged in 2 step Login")
	public void checkLogin(){
		Assert.assertTrue("Expected User to be logged in",twoStepLoginPage.checkLogin());
	}

}
