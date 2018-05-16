package mooltipass.automatedTests.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class TwoStepLoginPage extends AbstractPage{
	
	public TwoStepLoginPage (WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	@FindBy(xpath = "//button[@id='submitBtn']")
	private WebElement loginBtn;
	
	@FindBy(id = "username")
	private WebElement username;

	@FindBy(id = "password")
	private WebElement password;
	
	@FindBy(id = "nextBtn")
	private WebElement nextBtn;
	
	public void enterUsername(String value){
		sleep(1500);
		waitUntilAppears(username);
		username.sendKeys(value);
	}

	public void enterPassword(String value){
		sleep(1500);
		waitUntilAppears(password);
		password.sendKeys(value);
	}
	
	public void submit(){
		waitUntilAppears(loginBtn);
		loginBtn.click();
	}
	
	public void clickNext(){
		waitUntilAppears(nextBtn);
		nextBtn.click();
	}


	
	public boolean checkLogin(){		
	waitUntilAppears(By.xpath("//body[text()='Mooltipass logged!']"));
	return isElementPresent(By.xpath( "//body[text()='Mooltipass logged!']"));
	}

}
