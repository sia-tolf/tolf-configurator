// TOLF Configurator — Windows PowerShell export
(() => {
  const lang = (() => {
    const saved = localStorage.getItem("tolf-language");
    if (["en", "ru", "lv"].includes(saved)) return saved;
    const browser = (navigator.language || "en").toLowerCase();
    if (browser.startsWith("ru")) return "ru";
    if (browser.startsWith("lv")) return "lv";
    return "en";
  })();

  document.documentElement.lang = lang;

  const copy = {
    en: {
      importProfile: "Import Existing Profile",
      installProfile: "Install Profile",
      appleShare: "Share Apple (.mobileconfig)",
      appleSave: "Save Apple (.mobileconfig)",
      androidShare: "Share Android (.sswan)",
      androidSave: "Save Android (.sswan)",
      windowsShare: "Share Windows (.ps1)",
      windowsSave: "Save Windows (.ps1)",
      addRule: "+ Add Rule"
    },
    ru: {
      importProfile: "Импортировать профиль",
      installProfile: "Установить профиль",
      appleShare: "Поделиться Apple (.mobileconfig)",
      appleSave: "Сохранить Apple (.mobileconfig)",
      androidShare: "Поделиться Android (.sswan)",
      androidSave: "Сохранить Android (.sswan)",
      windowsShare: "Поделиться Windows (.ps1)",
      windowsSave: "Сохранить Windows (.ps1)",
      addRule: "+ Добавить правило"
    },
    lv: {
      importProfile: "Importēt profilu",
      installProfile: "Instalēt profilu",
      appleShare: "Kopīgot Apple (.mobileconfig)",
      appleSave: "Saglabāt Apple (.mobileconfig)",
      androidShare: "Kopīgot Android (.sswan)",
      androidSave: "Saglabāt Android (.sswan)",
      windowsShare: "Kopīgot Windows (.ps1)",
      windowsSave: "Saglabāt Windows (.ps1)",
      addRule: "+ Pievienot noteikumu"
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
    return ({"SHA2-256":"SHA256","SHA2-384":"SHA384","SHA2-512":"SHA512"})[value] || "SHA256";
  }

  function windowsPfs(values) {
    if (!values.pfs) return "None";
    return String(values.dhGroup) === "19" ? "ECP256" :
      String(values.dhGroup) === "20" ? "ECP384" : "PFS2048";
  }

  function buildWindowsPowerShell(values) {
    const name = psQuote(values.name);
    const server = psQuote(values.server);
    const username = psQuote(values.username);
    const encryption = windowsEncryption(values.encryption);
    const integrity = windowsIntegrity(values.integrity);
    const dh = windowsDhGroup(values.dhGroup);
    const pfs = windowsPfs(values);

    return `# TOLF Configurator — Windows IKEv2 profile\n# Run in Windows PowerShell as the target user.\n# Generated locally in the browser.\n\n$ErrorActionPreference = 'Stop'\n$Name = ${name}\n$Server = ${server}\n$UserName = ${username}\n\n# Replace an existing connection with the same name.\n$existing = Get-VpnConnection -Name $Name -ErrorAction SilentlyContinue\nif ($existing) {\n    Remove-VpnConnection -Name $Name -Force\n}\n\n# Windows built-in IKEv2 uses EAP-MSCHAPv2 here.\n$Eap = New-EapConfiguration\n\nAdd-VpnConnection \\`\n    -Name $Name \\`\n    -ServerAddress $Server \\`\n    -TunnelType Ikev2 \\`\n    -AuthenticationMethod Eap \\`\n    -EapConfigXmlStream $Eap.EapConfigXmlStream \\`\n    -EncryptionLevel Required \\`\n    -RememberCredential \\`\n    -Force\n\nSet-VpnConnectionIPsecConfiguration \\`\n    -ConnectionName $Name \\`\n    -AuthenticationTransformConstants SHA256128 \\`\n    -CipherTransformConstants ${encryption} \\`\n    -EncryptionMethod ${encryption} \\`\n    -IntegrityCheckMethod ${integrity} \\`\n    -DHGroup ${dh} \\`\n    -PfsGroup ${pfs} \\`\n    -Force\n\nWrite-Host \"VPN profile '$($Name)' created.\"\nWrite-Host \"Use Windows Settings > Network & Internet > VPN to connect.\"\nWrite-Host \"Username: $UserName\"\n\n# Note: Add-VpnConnection does not expose Apple-style Remote ID / Local ID fields.\n# Remote ID supplied in the configurator: ${String(values.remoteId || "").replace(/\r?\n/g, " ")}\n# Local ID supplied in the configurator: ${String(values.localId || "").replace(/\r?\n/g, " ")}\n`;
  }

  async function saveWindowsScript() {
    const values = collectValues();
    if (!validateValues(values)) return;

    const script = buildWindowsPowerShell(values);
    await shareOrSaveFile(
      script,
      outputBaseName(values.name) + ".ps1",
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
  windowsButton.textContent = runningOnWindows ? copy.windowsSave : copy.windowsShare;
  windowsButton.addEventListener("click", saveWindowsScript);
  action.appendChild(windowsButton);

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
