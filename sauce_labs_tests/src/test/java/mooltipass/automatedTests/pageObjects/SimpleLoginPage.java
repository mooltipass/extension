package mooltipass.automatedTests.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class SimpleLoginPage extends AbstractPage{
	
	public SimpleLoginPage (WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	@FindBy(xpath = "//button")
	private WebElement loginBtn;
	
	@FindBy(id = "username")
	private WebElement username;

	@FindBy(id = "password")
	private WebElement password;
	
	
	public void enterUsername(String value){
		waitUntilAppears(username);
		username.sendKeys(value);
	}

	public void enterPassword(String value){
		password.sendKeys(value);
	}
	
	public void submit(){
		loginBtn.click();
	}

	
	public boolean checkLogin(){		
	waitUntilAppears(By.xpath("//body[text()='Mooltipass logged!']"));
	return isElementPresent(By.xpath( "//body[text()='Mooltipass logged!']"));
	}
	
}
