import OlympusLogo from "../../assets/images/cerberus_gold_transparent.png";
import "./notfound.scss";

export default function NotFound() {
  return (
    <div id="not-found">
      <div className="not-found-header">
        <a href="https://cerberusdao.finance" target="_blank">
          <img className="branding-header-icon" src={OlympusLogo} alt="CerberusDAO" />
        </a>

        <h4>Page not found</h4>
      </div>
    </div>
  );
}
