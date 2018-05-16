package mooltipass.automatedTests.features;

import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junit.framework.Assert;
import mooltipass.automatedTests.config.WebDriverFactory;
import mooltipass.automatedTests.pageObjects.ModalLoginPage;

public class ModalLoginSteps {

	ModalLoginPage modalLoginPage= new ModalLoginPage(WebDriverFactory.get());
	
	
	@When("I go to Modal login page")
	public void goTologinPage(){
		modalLoginPage.clickGoToLogin();
		
	}
	
	@When("I login to Modal Login with '(.*)'")
	public void login(String username){
		
		modalLoginPage.enterUsername(username);
		String password ="password";
		modalLoginPage.enterPassword(password);
		modalLoginPage.submit();
	
		
	}
	
	
	@Then("I should be logged in Modal Login")
	public void checkLogin(){
		Assert.assertTrue("Expected User to be logged in",modalLoginPage.checkLogin());
	}
}
