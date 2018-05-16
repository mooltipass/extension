package mooltipass.automatedTests.features;

import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junit.framework.Assert;
import mooltipass.automatedTests.config.WebDriverFactory;
import mooltipass.automatedTests.pageObjects.EtsyLoginPage;

public class EtsySteps {
	EtsyLoginPage etsyLoginPage= new EtsyLoginPage(WebDriverFactory.get());
	
	
	@When("I go to Etsy login page")
	public void goTologinPage(){
		etsyLoginPage.clickGoToLogin();
		
	}
	
	@When("I login to Etsy Login with '(.*)'")
	public void login(String username){
		
		etsyLoginPage.enterUsername(username);
		String password ="password";
		etsyLoginPage.enterPassword(password);
		etsyLoginPage.submit();
	
		
	}
	
	
	@Then("I should be logged in Etsy Login")
	public void checkLogin(){
		Assert.assertTrue("Expected User to be logged in",etsyLoginPage.checkLogin());
	}
}
