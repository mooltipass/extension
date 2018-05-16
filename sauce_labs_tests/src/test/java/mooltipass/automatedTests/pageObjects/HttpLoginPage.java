package mooltipass.automatedTests.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class HttpLoginPage extends AbstractPage{
	
	public HttpLoginPage (WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}
	
	@FindBy(xpath = "//button")
	private WebElement loginBtn;
	
	@FindBy(xpath = "//input[@name='login']")
	private WebElement username;

	@FindBy(xpath = "//input[@name='password']")
	private WebElement password;
	
	public void enterUsername(String value){
		username.sendKeys(value);
	}

	public void enterPassword(String value){
		password.sendKeys(value);
	}
	
	public void submit(){
		loginBtn.click();
	}
	
	public boolean checkLogin(){		        
		return isElementPresent(By.xpath( "//h1"));
		}

}
