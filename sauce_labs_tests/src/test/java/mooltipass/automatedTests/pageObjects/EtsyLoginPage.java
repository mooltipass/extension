package mooltipass.automatedTests.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class EtsyLoginPage extends AbstractPage{
	
	public EtsyLoginPage (WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	@FindBy(id = "signin-button")
	private WebElement loginBtn;
	
	@FindBy(id = "username-existing")
	private WebElement username;

	@FindBy(id = "password-existing")
	private WebElement password;
	
	@FindBy(id = "sign-in")
	private WebElement goToLogin;
	
	public void enterUsername(String value){
		waitUntilAppears(username);
		username.sendKeys(value);
	}

	public void enterPassword(String value){
		waitUntilAppears(password);
		password.sendKeys(value);
	}
	
	public void submit(){
		waitUntilAppears(loginBtn);
		loginBtn.click();
	}
	
	public void clickGoToLogin(){
		waitUntilAppears(goToLogin);
		goToLogin.click();
		sleep(1500);
	}


	
	public boolean checkLogin(){		
	waitUntilAppears(By.xpath("//body[text()='Mooltipass logged!']"));
	return isElementPresent(By.xpath( "//body[text()='Mooltipass logged!']"));
	}


}
