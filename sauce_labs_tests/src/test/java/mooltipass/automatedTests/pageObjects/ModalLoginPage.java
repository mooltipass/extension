package mooltipass.automatedTests.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class ModalLoginPage extends AbstractPage{
	
	public ModalLoginPage (WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	@FindBy(xpath = "//button[@type='submit']")
	private WebElement loginBtn;
	
	@FindBy(id = "username")
	private WebElement username;

	@FindBy(id = "password")
	private WebElement password;
	
	@FindBy(id = "elUserSignIn")
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
