// TOLF Configurator — platform-specific UI and import logic
(() => {
  const platformInputs = Array.from(
    document.querySelectorAll('input[name="target-platform"]')
  );
  const importButtonEl = document.getElementById("import-button");
  const importFileEl = document.getElementById("import-file");
  const actionEl = document.querySelector(".action");

  if (!platformInputs.length || !importButtonEl || !importFileEl || !actionEl) {
    return;
  }

  const selectorStyle = document.createElement("style");
  selectorStyle.textContent = `
    main {
      padding-top: 0 !important;
    }

    .page-top {
      position: sticky !important;
      top: 0 !important;
      z-index: 50 !important;
      width: 100vw !important;
      min-height: 58px !important;
      margin-left: calc(50% - 50vw) !important;
      margin-right: calc(50% - 50vw) !important;
      margin-bottom: 30px !important;
      padding: 8px max(16px, calc((100vw - 720px) / 2)) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 16px !important;
      background: rgba(245, 245, 247, 0.86) !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
      backdrop-filter: saturate(180%) blur(20px) !important;
      -webkit-backdrop-filter: saturate(180%) blur(20px) !important;
    }

    .page-top .back {
      margin: 0 !important;
    }

    .target-platform-dot {
      width: 12px !important;
      height: 12px !important;
      flex: 0 0 12px !important;
      background: #ffffff !important;
    }

    .target-platform-choice input:checked + .target-platform-segment .target-platform-dot {
      background: #34c759 !important;
      border-color: #248a3d !important;
    }

    @media (prefers-color-scheme: dark) {
      .page-top {
        background: rgba(0, 0, 0, 0.84) !important;
        border-bottom-color: rgba(255, 255, 255, 0.09) !important;
      }

      .target-platform-dot {
        background: #ffffff !important;
      }

      .target-platform-choice input:checked + .target-platform-segment .target-platform-dot {
        background: #30d158 !important;
      }
    }
  `;
  document.head.appendChild(selectorStyle);

  const getLang = () => ["en", "ru", "lv"].includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "en";

  const translations = {
    en: {
      imported: "Configuration Imported",
      invalidAndroid: "The selected file is not a valid strongSwan .sswan configuration.",
      invalidWindows: "The selected file is not a supported TOLF Windows .ps1 configuration.",
      importFailed: "The configuration could not be imported.",
      windowsRequired: "Name, Server and Username are required."
    },
    ru: {
      imported: "Конфигурация импортирована",
      invalidAndroid: "Выбранный файл не является корректной конфигурацией strongSwan .sswan.",
      invalidWindows: "Выбранный файл не является поддерживаемой конфигурацией TOLF Windows .ps1.",
      importFailed: "Не удалось импортировать конфигурацию.",
      windowsRequired: "Необходимо заполнить Name, Server и Username."
    },
    lv: {
      imported: "Konfigurācija importēta",
      invalidAndroid: "Izvēlētais fails nav derīga strongSwan .sswan konfigurācija.",
      invalidWindows: "Izvēlētais fails nav atbalstīta TOLF Windows .ps1 konfigurācija.",
      importFailed: "Konfigurāciju neizdevās importēt.",
      windowsRequired: "Jānorāda Name, Server un Username."
    }
  };
  const copy = new Proxy({}, { get: (_, key) => translations[getLang()][key] });

  function detectPlatform() {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const uaPlatform = navigator.userAgentData?.platform || "";
    const touchPoints = navigator.maxTouchPoints || 0;

    if (/Android/i.test(ua) || /Android/i.test(uaPlatform)) {
      return "android";
    }

    if (/Windows/i.test(ua) || /Windows/i.test(uaPlatform) || /^Win/i.test(platform)) {
      return "windows";
    }

    if (/iPhone|iPad|iPod/i.test(ua)) {
      return "apple";
    }

    if (
      /macOS|Macintosh/i.test(uaPlatform) ||
      /Macintosh/i.test(ua) ||
      /^Mac/i.test(platform) ||
      (platform === "MacIntel" && touchPoints > 1)
    ) {
      return "apple";
    }

    return "apple";
  }

  const detectedPlatform = detectPlatform();
  const detectedInput = platformInputs.find(input => input.value === detectedPlatform);
  if (detectedInput) {
    detectedInput.checked = true;
  }

  function currentPlatform() {
    return document.querySelector('input[name="target-platform"]:checked')?.value || "apple";
  }

  window.tolfConfiguratorPlatform = currentPlatform;

  function fieldRow(id) {
    return document.getElementById(id)?.closest(".field, .switch-row") || null;
  }

  function show(element, visible) {
    if (!element) return;
    element.style.display = visible ? "" : "none";
  }

  const onDemandTitle = document.getElementById("on-demand-title");
  const onDemandGroup = document.getElementById("on-demand-group");
  const onDemandOptionsEl = document.getElementById("on-demand-options");

  function updateImportAccept(platform) {
    const accept = {
      apple: ".mobileconfig,application/x-apple-aspen-config,application/xml,text/xml",
      android: ".sswan,application/vnd.strongswan.profile,application/json,text/json",
      windows: ".ps1,text/plain"
    };
    importFileEl.accept = accept[platform] || accept.apple;
  }

  function updateActions(platform) {
    const install = document.getElementById("install-profile");
    const apple = document.getElementById("save-profile");
    const android = document.getElementById("save-strongswan");
    const windows = document.getElementById("save-windows");
    const launcher = document.getElementById("save-windows-launcher");
    const formatHelpRows = document.querySelectorAll("[data-platform-help]");

    show(install, platform === "apple");
    show(apple, platform === "apple");
    show(android, platform === "android");
    show(windows, platform === "windows");
    show(launcher, platform === "windows");
    formatHelpRows.forEach(row => {
      show(row, row.dataset.platformHelp === platform);
    });

    actionEl.style.gridTemplateColumns =
      platform === "android" ? "1fr" : "repeat(2, minmax(0, 1fr))";
  }

  function applyPlatformView() {
    const platform = currentPlatform();
    const apple = platform === "apple";
    const windows = platform === "windows";

    show(fieldRow("remote-id"), !windows);
    show(fieldRow("local-id"), !windows);
    show(fieldRow("password"), !windows);

    show(fieldRow("dpd"), apple);
    show(fieldRow("pfs"), true);
    show(fieldRow("mobike"), apple);
    show(fieldRow("redirects"), apple);
    show(fieldRow("internal-subnet"), apple);

    show(onDemandTitle, apple);
    show(onDemandGroup, apple);
    show(onDemandOptionsEl, apple);

    document.querySelectorAll(".platform-note").forEach(note => {
      note.style.display = "none";
    });

    updateImportAccept(platform);
    updateActions(platform);
    error.style.display = "none";
  }

  const originalValidateValues = validateValues;
  validateValues = function(values) {
    if (currentPlatform() !== "windows") {
      return originalValidateValues(values);
    }

    if (!values.name || !values.server || !values.username) {
      error.textContent = copy.windowsRequired;
      error.style.display = "block";
      return false;
    }

    error.style.display = "none";
    return true;
  };

  const originalUpdateOnDemandVisibility = updateOnDemandVisibility;
  updateOnDemandVisibility = function() {
    originalUpdateOnDemandVisibility();
    show(onDemandOptionsEl, currentPlatform() === "apple");
  };

  function setValue(id, value) {
    const element = document.getElementById(id);
    if (!element || value === undefined || value === null) return;
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = String(value);
    }
  }

  function importedBaseName(fileName) {
    return fileName.replace(/\.(mobileconfig|sswan|ps1)$/i, "").trim() || "IKEv2";
  }

  function resetImportedAppleState(file) {
    importedProfile = null;
    importedVpnPayloadIndex = -1;
    importedFileBaseName = importedBaseName(file.name);
  }

  function encryptionFromStrongSwan(value) {
    if (value === "aes128") return "AES-128";
    return "AES-256";
  }

  function integrityFromStrongSwan(value) {
    return ({ sha256: "SHA2-256", sha384: "SHA2-384", sha512: "SHA2-512" })[value] || "SHA2-256";
  }

  function dhFromStrongSwan(value) {
    return ({ modp2048: "14", ecp256: "19", ecp384: "20" })[value] || "14";
  }

  function applyStrongSwan(text, file) {
    let profile;
    try {
      profile = JSON.parse(text);
    } catch (_) {
      throw new Error(copy.invalidAndroid);
    }

    if (!profile || typeof profile !== "object" || !profile.remote || !profile.local) {
      throw new Error(copy.invalidAndroid);
    }

    const ike = String(profile["ike-proposal"] || "").split("-").filter(Boolean);
    const esp = String(profile["esp-proposal"] || "").split("-").filter(Boolean);

    setValue("name", profile.name || importedBaseName(file.name));
    setValue("server", profile.remote.addr || "");
    setValue("remote-id", profile.remote.id || "");
    setValue("local-id", profile.local.id || "");
    setValue("username", profile.local.eap_id || "");
    setValue("password", profile.local.shared_secret || "");

    if (ike.length >= 3) {
      setValue("ike-encryption", encryptionFromStrongSwan(ike[0]));
      setValue("ike-integrity", integrityFromStrongSwan(ike[1]));
      setValue("dh-group", dhFromStrongSwan(ike[2]));
    }

    setValue("pfs", esp.length >= 3);
    resetImportedAppleState(file);
  }

  function psUnquote(value) {
    return String(value || "").replace(/''/g, "'");
  }

  function psAssignment(text, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp("^\\$" + escaped + "\\s*=\\s*'((?:''|[^'])*)'", "m"));
    return match ? psUnquote(match[1]) : "";
  }

  function psProperty(text, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp("^\\s*" + escaped + "\\s*=\\s*'((?:''|[^'])*)'", "m"));
    return match ? psUnquote(match[1]) : "";
  }

  function applyWindows(text, file) {
    let data = null;
    const metadataMatch = text.match(/^# TOLF-Configurator-Metadata:\s*(\{.*\})\s*$/m);

    if (metadataMatch) {
      try {
        data = JSON.parse(metadataMatch[1]);
      } catch (_) {}
    }

    if (!data) {
      const name = psAssignment(text, "Name");
      const server = psAssignment(text, "Server");
      const username = psAssignment(text, "UserName");
      if (!name || !server || !username || !/TunnelType\s*=\s*'Ikev2'/i.test(text)) {
        throw new Error(copy.invalidWindows);
      }

      const encryption = psProperty(text, "EncryptionMethod");
      const integrity = psProperty(text, "IntegrityCheckMethod");
      const dh = psProperty(text, "DHGroup");
      const pfs = psProperty(text, "PfsGroup");

      data = {
        name,
        server,
        username,
        encryption: encryption === "AES128" ? "AES-128" : "AES-256",
        integrity: integrity === "SHA384" ? "SHA2-384" : "SHA2-256",
        dhGroup: ({ Group14: "14", ECP256: "19", ECP384: "20" })[dh] || "14",
        pfs: Boolean(pfs && pfs !== "None")
      };
    }

    if (data.platform && data.platform !== "windows") {
      throw new Error(copy.invalidWindows);
    }

    setValue("name", data.name || importedBaseName(file.name));
    setValue("server", data.server || "");
    setValue("username", data.username || "");
    setValue("ike-encryption", data.encryption || "AES-256");
    setValue("ike-integrity", data.integrity || "SHA2-256");
    setValue("dh-group", data.dhGroup || "14");
    setValue("pfs", Boolean(data.pfs));
    resetImportedAppleState(file);
  }

  function flashImported() {
    const original = importButtonEl.textContent;
    importButtonEl.textContent = copy.imported;
    setTimeout(() => {
      importButtonEl.textContent = original;
    }, 1600);
  }

  importFileEl.addEventListener("change", async event => {
    const platform = currentPlatform();
    if (platform === "apple") return;

    event.stopImmediatePropagation();

    const file = importFileEl.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      if (platform === "android") {
        applyStrongSwan(text, file);
      } else {
        applyWindows(text, file);
      }
      error.style.display = "none";
      flashImported();
    } catch (importError) {
      importedProfile = null;
      importedVpnPayloadIndex = -1;
      importedFileBaseName = null;
      error.textContent = importError.message || copy.importFailed;
      error.style.display = "block";
    }
  }, true);

  platformInputs.forEach(input => {
    input.addEventListener("change", applyPlatformView);
  });

  applyPlatformView();
})();
