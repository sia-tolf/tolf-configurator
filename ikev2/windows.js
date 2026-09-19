// TOLF Configurator — Windows PowerShell export
(() => {
  const requested = new URL(location.href).searchParams.get("lang");
  const lang = (() => {
    if (["en", "ru", "lv"].includes(requested)) return requested;
    const saved = localStorage.getItem("tolf-language");
    if (["en", "ru", "lv"].includes(saved)) return saved;
    const browser = (navigator.language || "en").toLowerCase();
    if (browser.startsWith("ru")) return "ru";
    if (browser.startsWith("lv")) return "lv";
    return "en";
  })();

  localStorage.setItem("tolf-language", lang);
  document.documentElement.lang = lang;

  const copy = {
    en: {
      importProfile: "Import Existing Configuration",
      installProfile: "Install Profile",
      appleShare: "Share Apple (.mobileconfig)",
      appleSave: "Save Apple (.mobileconfig)",
      androidShare: "Share Android (.sswan)",
      androidSave: "Save Android (.sswan)",
      windowsShare: "Share .ps1",
      windowsSave: "Save .ps1",
      launcherShare: "Share .cmd",
      launcherSave: "Save .cmd",
      addRule: "+ Add Rule",
      sha512Unsupported: "Windows PowerShell export supports SHA-256 or SHA-384. Select one of those IKE Integrity options."
    },
    ru: {
      importProfile: "Импортировать конфигурацию",
      installProfile: "Установить профиль",
      appleShare: "Поделиться Apple (.mobileconfig)",
      appleSave: "Сохранить Apple (.mobileconfig)",
      androidShare: "Поделиться Android (.sswan)",
      androidSave: "Сохранить Android (.sswan)",
      windowsShare: "Поделиться .ps1",
      windowsSave: "Сохранить .ps1",
      launcherShare: "Поделиться .cmd",
      launcherSave: "Сохранить .cmd",
      addRule: "+ Добавить правило",
      sha512Unsupported: "Экспорт Windows PowerShell поддерживает SHA-256 или SHA-384. Выберите один из этих вариантов IKE Integrity."
    },
    lv: {
      importProfile: "Importēt esošu konfigurāciju",
      installProfile: "Instalēt profilu",
      appleShare: "Kopīgot Apple (.mobileconfig)",
      appleSave: "Saglabāt Apple (.mobileconfig)",
      androidShare: "Kopīgot Android (.sswan)",
      androidSave: "Saglabāt Android (.sswan)",
      windowsShare: "Kopīgot .ps1",
      windowsSave: "Saglabāt .ps1",
      launcherShare: "Kopīgot .cmd",
      launcherSave: "Saglabāt .cmd",
      addRule: "+ Pievienot noteikumu",
      sha512Unsupported: "Windows PowerShell eksports atbalsta SHA-256 vai SHA-384. Izvēlieties vienu no šīm IKE Integrity opcijām."
    }
  }[lang];

  const psQuote = value => `'${String(value ?? "").replace(/'/g, "''")}'`;

  function windowsDhGroup(value) {
    return ({"14":"Group14","19":"ECP256","20":"ECP384"})[String(value)] || "Group14";
  }

  function windowsEncryption(value) {
    return value === "AES-128" ? "AES128" : "AES256";
  }

  function windowsIntegrity(value) {
    return value === "SHA2-384" ? "SHA384" : "SHA256";
  }

  function windowsAuthTransform(value) {
    return value === "SHA2-384" ? "None" : "SHA256128";
  }

  function windowsPfs(values) {
    if (!values.pfs) return "None";
    if (String(values.dhGroup) === "19") return "ECP256";
    if (String(values.dhGroup) === "20") return "ECP384";
    return "PFS2048";
  }

  function buildWindowsPowerShell(values) {
    const name = psQuote(values.name);
    const server = psQuote(values.server);
    const username = psQuote(values.username);
    const encryption = windowsEncryption(values.encryption);
    const integrity = windowsIntegrity(values.integrity);
    const authTransform = windowsAuthTransform(values.integrity);
    const dh = windowsDhGroup(values.dhGroup);
    const pfs = windowsPfs(values);
    const metadata = JSON.stringify({
      version: 1,
      platform: "windows",
      name: values.name,
      server: values.server,
      username: values.username,
      encryption: values.encryption,
      integrity: values.integrity,
      dhGroup: String(values.dhGroup),
      pfs: Boolean(values.pfs)
    });

    return `# TOLF Configurator — Windows IKEv2 profile\n# TOLF-Configurator-Metadata: ${metadata}\n# Run in Windows PowerShell as the target user.\n# Generated locally in the browser.\n\n$ErrorActionPreference = 'Stop'\n$Name = ${name}\n$Server = ${server}\n$UserName = ${username}\n\n# Replace an existing connection with the same name.\n$existing = Get-VpnConnection -Name $Name -ErrorAction SilentlyContinue\nif ($existing) {\n    Remove-VpnConnection -Name $Name -Force\n}\n\n# Windows built-in IKEv2 uses EAP-MSCHAPv2 here.\n$Eap = New-EapConfiguration\n\n$VpnParams = @{\n    Name = $Name\n    ServerAddress = $Server\n    TunnelType = 'Ikev2'\n    AuthenticationMethod = 'Eap'\n    EapConfigXmlStream = $Eap.EapConfigXmlStream\n    EncryptionLevel = 'Required'\n    RememberCredential = $true\n    Force = $true\n}\nAdd-VpnConnection @VpnParams\n\n$IpsecParams = @{\n    ConnectionName = $Name\n    AuthenticationTransformConstants = '${authTransform}'\n    CipherTransformConstants = '${encryption}'\n    EncryptionMethod = '${encryption}'\n    IntegrityCheckMethod = '${integrity}'\n    DHGroup = '${dh}'\n    PfsGroup = '${pfs}'\n    Force = $true\n}\nSet-VpnConnectionIPsecConfiguration @IpsecParams\n\nWrite-Host \"VPN profile '$($Name)' created.\"\nWrite-Host \"Use Windows Settings > Network & Internet > VPN to connect.\"\nWrite-Host \"Username: $UserName\"\n`;
  }

  function buildWindowsLauncher() {
    return `@echo off\r\nsetlocal\r\nset "PS1=%~dp0%~n0.ps1"\r\nif not exist "%PS1%" (\r\n  echo PowerShell file not found: "%PS1%"\r\n  echo Keep this .cmd file in the same folder as the .ps1 file with the same name.\r\n  pause\r\n  exit /b 1\r\n)\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%"\r\nset "RC=%ERRORLEVEL%"\r\nif not "%RC%"=="0" (\r\n  echo.\r\n  echo Setup failed with exit code %RC%.\r\n  pause\r\n)\r\nexit /b %RC%\r\n`;
  }

  function getValidatedWindowsValues() {
    const values = collectValues();
    if (!validateValues(values)) return null;

    if (values.integrity === "SHA2-512") {
      error.textContent = copy.sha512Unsupported;
      error.style.display = "block";
      return null;
    }

    error.style.display = "none";
    return values;
  }

  async function saveWindowsScript() {
    const values = getValidatedWindowsValues();
    if (!values) return;

    await shareOrSaveFile(
      buildWindowsPowerShell(values),
      outputBaseName(values.name) + ".ps1",
      "text/plain;charset=utf-8"
    );
  }

  async function saveWindowsLauncher() {
    const values = getValidatedWindowsValues();
    if (!values) return;

    await shareOrSaveFile(
      buildWindowsLauncher(),
      outputBaseName(values.name) + ".cmd",
      "text/plain;charset=utf-8"
    );
  }

  const action = document.querySelector(".action");
  const strongSwanButton = document.getElementById("save-strongswan");
  if (!action || !strongSwanButton) return;

  const windowsButton = document.createElement("button");
  windowsButton.id = "save-windows";
  windowsButton.className = "action-button save-button";
  windowsButton.type = "button";
  windowsButton.dataset.i18n = runningOnWindows ? "saveWindowsScript" : "shareWindowsScript";
  windowsButton.textContent = runningOnWindows ? copy.windowsSave : copy.windowsShare;
  windowsButton.addEventListener("click", saveWindowsScript);
  action.appendChild(windowsButton);

  const launcherButton = document.createElement("button");
  launcherButton.id = "save-windows-launcher";
  launcherButton.className = "action-button save-button";
  launcherButton.type = "button";
  launcherButton.dataset.i18n = runningOnWindows ? "saveWindowsLauncher" : "shareWindowsLauncher";
  launcherButton.textContent = runningOnWindows ? copy.launcherSave : copy.launcherShare;
  launcherButton.addEventListener("click", saveWindowsLauncher);
  action.appendChild(launcherButton);

  const importButtonEl = document.getElementById("import-button");
  const installButtonEl = document.getElementById("install-profile");
  const appleButtonEl = document.getElementById("save-profile");
  const androidButtonEl = document.getElementById("save-strongswan");
  const addRuleButtonEl = document.getElementById("add-rule");

  if (importButtonEl) importButtonEl.textContent = copy.importProfile;
  if (installButtonEl) installButtonEl.textContent = copy.installProfile;
  if (appleButtonEl) appleButtonEl.textContent = runningOnWindows ? copy.appleSave : copy.appleShare;
  if (androidButtonEl) androidButtonEl.textContent = runningOnWindows ? copy.androidSave : copy.androidShare;
  if (addRuleButtonEl) addRuleButtonEl.textContent = copy.addRule;
})();
