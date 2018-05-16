package mooltipass.automatedTests.features;

import org.openqa.selenium.By;

import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junit.framework.Assert;
import mooltipass.automatedTests.config.WebDriverFactory;
import mooltipass.automatedTests.pageObjects.HttpLoginPage;

public class HttpLoginSteps {


	HttpLoginPage httpLoginPage= new HttpLoginPage(WebDriverFactory.get());

	
	@When("I login to http login with '(.*)'")
	public void login(String username){
		httpLoginPage.enterUsername(username);
		String password ="password";
		httpLoginPage.enterPassword(password);
		httpLoginPage.submit();
		
	}
	
	
	@Then("I should be logged in http login")
	public void checkLogin(){
		Assert.assertTrue("Expected User to be logged in",httpLoginPage.checkLogin());
	}

}
