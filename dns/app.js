const providers = {
  quad9: { name: "Quad9", protocol: "HTTPS", url: "https://dns.quad9.net/dns-query" },
  cloudflare: { name: "Cloudflare", protocol: "HTTPS", url: "https://cloudflare-dns.com/dns-query" },
  yandex: { name: "Yandex DNS", protocol: "HTTPS", url: "https://common.dot.dns.yandex.net/dns-query" },
  dns4eu: { name: "DNS4EU", protocol: "HTTPS", url: "https://unfiltered.joindns4.eu/dns-query" }
};

const I = {
  en: {
    title: "TOLF DNS",
    subtitle: "Create a DNS configuration profile directly in your browser.",
    help: "Help",
    providerMode: "Provider",
    customMode: "Custom DNS",
    provider: "DNS provider",
    protocol: "Protocol",
    endpoint: "Endpoint",
    plainDns: "DNS (unencrypted)",
    dohUrl: "DoH URL",
    dotHost: "DoT server name",
    addresses: "DNS addresses",
    addressesHint: "Enter IPv4 or IPv6 addresses separated by commas or new lines.",
    profileName: "Profile name",
    install: "Install Profile",
    share: "Share Profile",
    privateTitle: "Processed locally",
    privateText: "DNS settings and generated profiles stay in this browser and are not sent to TOLF.",
    invalidUrl: "Enter a valid HTTPS DoH URL.",
    invalidHost: "Enter a DoT server name.",
    invalidAddresses: "Enter at least one DNS address.",
    nameRequired: "Enter a profile name."
  },
  ru: {
    title: "TOLF DNS",
    subtitle: "Создайте профиль DNS прямо в браузере.",
    help: "Помощь",
    providerMode: "Провайдер",
    customMode: "Свой DNS",
    provider: "DNS-провайдер",
    protocol: "Протокол",
    endpoint: "Адрес",
    plainDns: "DNS (без шифрования)",
    dohUrl: "Адрес DoH",
    dotHost: "Имя сервера DoT",
    addresses: "Адреса DNS",
    addressesHint: "Введите адреса IPv4 или IPv6 через запятую или с новой строки.",
    profileName: "Название профиля",
    install: "Установить профиль",
    share: "Поделиться профилем",
    privateTitle: "Обрабатывается локально",
    privateText: "Настройки DNS и создаваемый профиль остаются в браузере и не отправляются в TOLF.",
    invalidUrl: "Введите корректный HTTPS-адрес DoH.",
    invalidHost: "Введите имя сервера DoT.",
    invalidAddresses: "Введите хотя бы один адрес DNS.",
    nameRequired: "Введите название профиля."
  },
  lv: {
    title: "TOLF DNS",
    subtitle: "Izveidojiet DNS konfigurācijas profilu tieši pārlūkprogrammā.",
    help: "Palīdzība",
    providerMode: "Pakalpojuma sniedzējs",
    customMode: "Savs DNS",
    provider: "DNS pakalpojuma sniedzējs",
    protocol: "Protokols",
    endpoint: "Adrese",
    plainDns: "DNS (nešifrēts)",
    dohUrl: "DoH adrese",
    dotHost: "DoT servera nosaukums",
    addresses: "DNS adreses",
    addressesHint: "Ievadiet IPv4 vai IPv6 adreses, atdalot tās ar komatiem vai jaunām rindām.",
    profileName: "Profila nosaukums",
    install: "Instalēt profilu",
    share: "Kopīgot profilu",
    privateTitle: "Apstrāde notiek lokāli",
    privateText: "DNS iestatījumi un izveidotie profili paliek pārlūkprogrammā un netiek nosūtīti TOLF.",
    invalidUrl: "Ievadiet derīgu HTTPS DoH adresi.",
    invalidHost: "Ievadiet DoT servera nosaukumu.",
    invalidAddresses: "Ievadiet vismaz vienu DNS adresi.",
    nameRequired: "Ievadiet profila nosaukumu."
  }
};

const supportedLanguages = ["en", "ru", "lv"];
const supportedPlatforms = ["apple", "android", "windows"];
const $ = id => document.getElementById(id);

const provider = $("provider");
const providerProtocol = $("providerProtocol");
const providerEndpoint = $("providerEndpoint");
const providerPanel = $("providerPanel");
const customPanel = $("customPanel");
const customProtocol = $("customProtocol");
const urlField = $("urlField");
const hostField = $("hostField");
const addressesField = $("addressesField");
const error = $("error");
const profileName = $("profileName");

const params = new URL(location.href).searchParams;
const requestedLanguage = params.get("lang");
const savedLanguage = localStorage.getItem("tolf-language") || localStorage.getItem("tolfLanguage");
let lang = supportedLanguages.includes(requestedLanguage)
  ? requestedLanguage
  : supportedLanguages.includes(savedLanguage)
    ? savedLanguage
    : (navigator.language || "en").toLowerCase().startsWith("ru")
      ? "ru"
      : (navigator.language || "en").toLowerCase().startsWith("lv")
        ? "lv"
        : "en";

function normalizePlatform(value) {
  if (value === "ios" || value === "ipados") return "apple";
  return supportedPlatforms.includes(value) ? value : null;
}

const requestedPlatform = normalizePlatform(params.get("platform"));
const savedPlatform = normalizePlatform(localStorage.getItem("tolf-platform"));
let selectedPlatform = requestedPlatform || savedPlatform || "apple";

let mode = "provider";

function tr(key) {
  return I[lang][key] || I.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = lang;
  localStorage.setItem("tolf-language", lang);
  localStorage.setItem("tolfLanguage", lang);

  document.querySelectorAll("[data-t]").forEach(node => {
    node.textContent = tr(node.dataset.t);
  });

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  const back = $("backLink");
  if (back) back.href = "/?lang=" + encodeURIComponent(lang);

  const help = $("helpLink");
  if (help) help.href = "https://tolf.is/?lang=" + encodeURIComponent(lang) + "#help";
}

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  url.searchParams.set("platform", selectedPlatform);
  history.replaceState(null, "", url);
}

document.querySelectorAll("[data-lang]").forEach(button => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    applyLanguage();
    syncUrl();
  });
});

function applyPlatform() {
  localStorage.setItem("tolf-platform", selectedPlatform);
  document.querySelectorAll("[data-platform]").forEach(button => {
    const active = button.dataset.platform === selectedPlatform;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

document.querySelectorAll("[data-platform]").forEach(button => {
  button.addEventListener("click", () => {
    selectedPlatform = button.dataset.platform;
    applyPlatform();
    syncUrl();
  });
});

document.querySelectorAll(".mode").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll(".mode").forEach(item => {
      item.classList.toggle("active", item === button);
    });
    providerPanel.classList.toggle("hidden", mode !== "provider");
    customPanel.classList.toggle("hidden", mode !== "custom");
    hideError();

    if (mode === "provider") updateProvider();
    else profileName.value = "TOLF DNS Custom";
  });
});

function updateProvider() {
  const p = providers[provider.value];
  providerProtocol.textContent = p.protocol === "HTTPS" ? "DoH" : "DoT";
  providerEndpoint.textContent = p.url;
  profileName.value = "TOLF DNS " + p.name;
}

provider.addEventListener("change", updateProvider);

function updateCustom() {
  const protocol = customProtocol.value;
  urlField.classList.toggle("hidden", protocol !== "HTTPS");
  hostField.classList.toggle("hidden", protocol !== "TLS");
  addressesField.classList.toggle("hidden", protocol === "HTTPS");
}

customProtocol.addEventListener("change", updateCustom);

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function uuid() {
  return crypto.randomUUID().toUpperCase();
}

function addresses() {
  return $("serverAddresses").value
    .split(/[\s,;]+/)
    .map(value => value.trim())
    .filter(Boolean);
}

function validate() {
  if (mode === "provider") return null;

  if (customProtocol.value === "HTTPS") {
    try {
      const url = new URL($("serverUrl").value.trim());
      if (url.protocol !== "https:") throw new Error();
    } catch {
      return tr("invalidUrl");
    }
  }

  if (customProtocol.value === "TLS" && !$("serverName").value.trim()) {
    return tr("invalidHost");
  }

  if (customProtocol.value !== "HTTPS" && !addresses().length) {
    return tr("invalidAddresses");
  }

  return null;
}

function hideError() {
  error.classList.add("hidden");
}

function proposedProfileName() {
  if (mode === "provider") return "TOLF DNS " + providers[provider.value].name;
  return "TOLF DNS Custom";
}

function askProfileName() {
  const proposed = profileName.value.trim() || proposedProfileName();
  const value = window.prompt(tr("profileName"), proposed);
  if (value === null) return false;

  const name = value.trim();
  if (!name) {
    error.textContent = tr("nameRequired");
    error.classList.remove("hidden");
    return false;
  }

  profileName.value = name;
  hideError();
  return true;
}

function build() {
  const validationError = validate();
  if (validationError) {
    error.textContent = validationError;
    error.classList.remove("hidden");
    return null;
  }

  hideError();

  const name = profileName.value.trim();
  const profileUuid = uuid();
  const dnsUuid = uuid();
  let settings = "";

  if (mode === "provider") {
    const p = providers[provider.value];
    settings = `<key>DNSProtocol</key><string>HTTPS</string><key>ServerURL</key><string>${esc(p.url)}</string>`;
  } else if (customProtocol.value === "HTTPS") {
    settings = `<key>DNSProtocol</key><string>HTTPS</string><key>ServerURL</key><string>${esc($("serverUrl").value.trim())}</string>`;
  } else {
    const protocol = customProtocol.value;
    settings =
      `<key>DNSProtocol</key><string>${protocol}</string>` +
      (protocol === "TLS"
        ? `<key>ServerName</key><string>${esc($("serverName").value.trim())}</string>`
        : "") +
      `<key>ServerAddresses</key><array>${addresses().map(value => `<string>${esc(value)}</string>`).join("")}</array>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>PayloadContent</key><array><dict>
<key>DNSSettings</key><dict>${settings}</dict>
<key>PayloadDisplayName</key><string>${esc(name)}</string>
<key>PayloadIdentifier</key><string>is.tolf.configurator.dns.settings.${dnsUuid.toLowerCase()}</string>
<key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
<key>PayloadUUID</key><string>${dnsUuid}</string>
<key>PayloadVersion</key><integer>1</integer>
</dict></array>
<key>PayloadDescription</key><string>DNS configuration generated locally by TOLF Configurator.</string>
<key>PayloadDisplayName</key><string>${esc(name)}</string>
<key>PayloadIdentifier</key><string>is.tolf.configurator.dns.profile.${profileUuid.toLowerCase()}</string>
<key>PayloadOrganization</key><string>TOLF Configurator</string>
<key>PayloadRemovalDisallowed</key><false/>
<key>PayloadType</key><string>Configuration</string>
<key>PayloadUUID</key><string>${profileUuid}</string>
<key>PayloadVersion</key><integer>1</integer>
</dict></plist>`;
}

function fileName() {
  return (profileName.value.trim() || "TOLF DNS")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-") + ".mobileconfig";
}

function download(content) {
  const blob = new Blob([content], { type: "application/x-apple-aspen-config" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("install").addEventListener("click", () => {
  if (!askProfileName()) return;
  const content = build();
  if (content) download(content);
});

$("share").addEventListener("click", async () => {
  if (!askProfileName()) return;
  const content = build();
  if (!content) return;

  const file = new File([content], fileName(), {
    type: "application/x-apple-aspen-config"
  });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  download(content);
});

applyLanguage();
applyPlatform();
syncUrl();
updateProvider();
updateCustom();
