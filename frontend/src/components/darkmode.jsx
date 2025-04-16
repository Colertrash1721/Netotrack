import {React,useState} from "react";
import Icons from "./icons";

export default function Darkmode() {
    const [darkMode, setDarkMode] = useState(false);

    const handleDarkMode = () => {
        let sheet = document.styleSheets[0];
    
        setDarkMode(!darkMode);
    
        for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
          if (sheet.cssRules[i].selectorText === "input::placeholder") {
            sheet.deleteRule(i);
          }
        }
    
        if (darkMode) {
          document.body.style.backgroundColor = "white";
          document.body.style.color = "black";
          document.styleSheets[0].insertRule(
            "input::placeholder { color: #9e9e9e; }",
            0
          );
          document.querySelector('a').style.color = "black";
          if (document.querySelector('select')) {
            document.querySelector('select').style.color = "#9e9e9e";
          }
        } else {
          document.body.style.backgroundColor = "#656b6c";
          document.body.style.color = "white";
          document.styleSheets[0].insertRule(
            "input::placeholder { color: white; }",
            0
          );
          document.querySelector('a').style.color = "white";
          if (document.querySelector('select')) {
            document.querySelector('select').style.color = "white";
          }
        }
      };

  return (
    <div className="darkmode">
      <div className="darkmode_icon">
        <div className="sun-icon" onClick={handleDarkMode}>
          <Icons name="sun" color="#1EB3CF" size="35px" />
        </div>
        <div className="moon-icon" onClick={handleDarkMode}>
          <Icons name="moon" color="white" size="35px" />
        </div>
      </div>
    </div>
  );
}
