const providers = {
  quad9: { name: "Quad9", url: "https://dns.quad9.net/dns-query", dotHost: "dns.quad9.net" },
  quad9ecs: { name: "Quad9 ECS", url: "https://dns11.quad9.net/dns-query", dotHost: "dns11.quad9.net" },
  cloudflare: { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query", dotHost: "one.one.one.one" },
  google: { name: "Google Public DNS", url: "https://dns.google/dns-query", dotHost: "dns.google" },
  adguard: { name: "AdGuard DNS", url: "https://unfiltered.adguard-dns.com/dns-query", dotHost: "unfiltered.adguard-dns.com" },
  mullvad: { name: "Mullvad DNS", url: "https://dns.mullvad.net/dns-query", dotHost: "dns.mullvad.net" },
  dns4eu: { name: "DNS4EU", url: "https://unfiltered.joindns4.eu/dns-query", dotHost: "unfiltered.joindns4.eu" },
  yandex: { name: "Yandex DNS", url: "https://common.dot.dns.yandex.net/dns-query", dotHost: "common.dot.dns.yandex.net" },
  dnspod: { name: "DNSPod / Tencent", url: "https://doh.pub/dns-query", dotHost: "dot.pub" },
  alidns: { name: "AliDNS", url: "https://dns.alidns.com/dns-query", dotHost: "dns.alidns.com" }
};

const I = {
  en: {
    title: "TOLF DNS",
    subtitle: "Configure DNS for Apple, Android or Windows directly in your browser.",
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
    androidCopy: "Copy Private DNS",
    windowsCopy: "Copy Windows Setup",
    howTo: "How to set up",
    copied: "Copied",
    privateTitle: "Processed locally",
    privateText: "DNS settings and generated profiles stay in this browser and are not sent to TOLF.",
    invalidUrl: "Enter a valid HTTPS DoH URL.",
    invalidHost: "Enter a DoT server name.",
    invalidAddresses: "Enter at least one DNS address.",
    nameRequired: "Enter a profile name.",
    androidNeedDot: "Android Private DNS requires DNS over TLS (DoT). Choose DoT and enter a server name.",
    windowsNeedDoh: "Windows automatic encrypted setup requires DNS over HTTPS (DoH). Choose DoH and enter a valid HTTPS URL.",
    androidHelp: "Android: Settings → Network & internet → Private DNS → Private DNS provider hostname. Paste the copied hostname and save.",
    windowsHelp: "Windows: copy the setup block, open PowerShell normally and paste it. The script will request administrator rights through the standard UAC prompt, then configure DoH on active physical network adapters."
  },
  ru: {
    title: "TOLF DNS",
    subtitle: "Настройте DNS для Apple, Android или Windows прямо в браузере.",
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
    androidCopy: "Скопировать Private DNS",
    windowsCopy: "Скопировать настройку Windows",
    howTo: "Как настроить",
    copied: "Скопировано",
    privateTitle: "Обрабатывается локально",
    privateText: "Настройки DNS и создаваемый профиль остаются в браузере и не отправляются в TOLF.",
    invalidUrl: "Введите корректный HTTPS-адрес DoH.",
    invalidHost: "Введите имя сервера DoT.",
    invalidAddresses: "Введите хотя бы один адрес DNS.",
    nameRequired: "Введите название профиля.",
    androidNeedDot: "Для системного Private DNS Android нужен DNS over TLS (DoT). Выберите DoT и укажите имя сервера.",
    windowsNeedDoh: "Для автоматической защищённой настройки Windows нужен DNS over HTTPS (DoH). Выберите DoH и укажите корректный HTTPS-адрес.",
    androidHelp: "Android: Настройки → Сеть и интернет → Частный DNS → Имя хоста поставщика частного DNS. Вставьте скопированное имя и сохраните.",
    windowsHelp: "Windows: скопируйте блок настройки, откройте обычный PowerShell и вставьте его. Скрипт сам запросит права администратора через стандартное окно UAC и затем настроит DoH на активных физических сетевых интерфейсах."
  },
  lv: {
    title: "TOLF DNS",
    subtitle: "Konfigurējiet DNS Apple, Android vai Windows ierīcei tieši pārlūkprogrammā.",
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
    androidCopy: "Kopēt Private DNS",
    windowsCopy: "Kopēt Windows iestatīšanu",
    howTo: "Kā iestatīt",
    copied: "Nokopēts",
    privateTitle: "Apstrāde notiek lokāli",
    privateText: "DNS iestatījumi un izveidotie profili paliek pārlūkprogrammā un netiek nosūtīti TOLF.",
    invalidUrl: "Ievadiet derīgu HTTPS DoH adresi.",
    invalidHost: "Ievadiet DoT servera nosaukumu.",
    invalidAddresses: "Ievadiet vismaz vienu DNS adresi.",
    nameRequired: "Ievadiet profila nosaukumu.",
    androidNeedDot: "Android sistēmas Private DNS nepieciešams DNS over TLS (DoT). Izvēlieties DoT un ievadiet servera nosaukumu.",
    windowsNeedDoh: "Windows automātiskajai šifrētajai iestatīšanai nepieciešams DNS over HTTPS (DoH). Izvēlieties DoH un ievadiet derīgu HTTPS adresi.",
    androidHelp: "Android: Iestatījumi → Tīkls un internets → Privātais DNS → Privātā DNS pakalpojuma sniedzēja resursdatora nosaukums. Ielīmējiet nokopēto nosaukumu un saglabājiet.",
    windowsHelp: "Windows: nokopējiet iestatīšanas bloku, atveriet parastu PowerShell un ielīmējiet to. Skripts pats pieprasīs administratora tiesības ar standarta UAC logu un pēc tam konfigurēs DoH aktīvajiem fiziskajiem tīkla adapteriem."
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
const primaryAction = $("install");
const secondaryAction = $("share");

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

function showError(text) {
  error.textContent = text;
  error.classList.remove("hidden");
}

function hideError() {
  error.classList.add("hidden");
}

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  url.searchParams.set("platform", selectedPlatform);
  history.replaceState(null, "", url);
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

  updateActions();
  updateProviderDisplay();
}

document.querySelectorAll("[data-lang]").forEach(button => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    applyLanguage();
    syncUrl();
  });
});

function updateActions() {
  if (selectedPlatform === "apple") {
    primaryAction.textContent = tr("install");
    secondaryAction.textContent = tr("share");
  } else if (selectedPlatform === "android") {
    primaryAction.textContent = tr("androidCopy");
    secondaryAction.textContent = tr("howTo");
  } else {
    primaryAction.textContent = tr("windowsCopy");
    secondaryAction.textContent = tr("howTo");
  }
}

function applyPlatform() {
  localStorage.setItem("tolf-platform", selectedPlatform);

  document.querySelectorAll("[data-platform]").forEach(button => {
    const active = button.dataset.platform === selectedPlatform;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  updateActions();
  updateProviderDisplay();
  hideError();
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

    if (mode === "provider") {
      updateProvider();
    } else {
      profileName.value = "TOLF DNS Custom";
      updateCustom();
    }
  });
});

function updateProviderDisplay() {
  if (mode !== "provider") return;
  const p = providers[provider.value];

  if (selectedPlatform === "android") {
    providerProtocol.textContent = "DoT";
    providerEndpoint.textContent = p.dotHost;
  } else {
    providerProtocol.textContent = "DoH";
    providerEndpoint.textContent = p.url;
  }
}

function updateProvider() {
  const p = providers[provider.value];
  profileName.value = "TOLF DNS " + p.name;
  updateProviderDisplay();
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

function validHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateApple() {
  if (mode === "provider") return null;

  if (customProtocol.value === "HTTPS" && !validHttpsUrl($("serverUrl").value.trim())) {
    return tr("invalidUrl");
  }

  if (customProtocol.value === "TLS" && !$("serverName").value.trim()) {
    return tr("invalidHost");
  }

  if (customProtocol.value !== "HTTPS" && !addresses().length) {
    return tr("invalidAddresses");
  }

  return null;
}

function androidHostname() {
  if (mode === "provider") return providers[provider.value].dotHost;
  if (customProtocol.value !== "TLS") return null;
  return $("serverName").value.trim() || null;
}

function windowsDohUrl() {
  if (mode === "provider") return providers[provider.value].url;
  if (customProtocol.value !== "HTTPS") return null;
  const value = $("serverUrl").value.trim();
  return validHttpsUrl(value) ? value : null;
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
    showError(tr("nameRequired"));
    return false;
  }

  profileName.value = name;
  hideError();
  return true;
}

function buildAppleProfile() {
  const validationError = validateApple();
  if (validationError) {
    showError(validationError);
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

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function flashCopied(button, original) {
  button.textContent = tr("copied");
  setTimeout(() => {
    button.textContent = original;
  }, 1500);
}

function psSingleQuoted(value) {
  return String(value).replaceAll("'", "''");
}

function buildWindowsScript() {
  const dohUrl = windowsDohUrl();
  if (!dohUrl) return null;

  const dohHost = new URL(dohUrl).hostname;
  const host = psSingleQuoted(dohHost);
  const template = psSingleQuoted(dohUrl);

  return `$AdminScript = @'
$ErrorActionPreference = "Stop"
$DoHHost = '${host}'
$DoHTemplate = '${template}'

$resolved = @(
  Resolve-DnsName -Name $DoHHost -Type A -DnsOnly |
  Where-Object { $_.IPAddress } |
  Select-Object -ExpandProperty IPAddress -Unique |
  Select-Object -First 2
)

if (-not $resolved.Count) {
  throw "Could not resolve the DoH server hostname: $DoHHost"
}

$test = & netsh dns show encryption 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "This Windows version does not support native DNS-over-HTTPS configuration."
}

foreach ($ip in $resolved) {
  & netsh dns delete encryption server=$ip 2>$null | Out-Null
  & netsh dns add encryption server=$ip dohtemplate=$DoHTemplate autoupgrade=yes udpfallback=no | Out-Null
}

$adapters = @(
  Get-NetAdapter -Physical |
  Where-Object { $_.Status -eq "Up" }
)

if (-not $adapters.Count) {
  throw "No active physical network adapter was found."
}

foreach ($adapter in $adapters) {
  Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses $resolved
}

Clear-DnsClientCache
Write-Host "TOLF DNS configured successfully." -ForegroundColor Green
Write-Host ("DoH: " + $DoHTemplate)
Write-Host ("DNS: " + ($resolved -join ", "))
'@

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
  Invoke-Expression $AdminScript
} else {
  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($AdminScript))
  Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -EncodedCommand $encoded"
}`;
}

primaryAction.addEventListener("click", async () => {
  hideError();

  if (selectedPlatform === "apple") {
    if (!askProfileName()) return;
    const content = buildAppleProfile();
    if (content) download(content);
    return;
  }

  if (selectedPlatform === "android") {
    const hostname = androidHostname();
    if (!hostname) {
      showError(tr("androidNeedDot"));
      return;
    }
    const original = tr("androidCopy");
    if (await copyText(hostname)) flashCopied(primaryAction, original);
    return;
  }

  const script = buildWindowsScript();
  if (!script) {
    showError(tr("windowsNeedDoh"));
    return;
  }

  const original = tr("windowsCopy");
  if (await copyText(script)) flashCopied(primaryAction, original);
});

secondaryAction.addEventListener("click", async () => {
  hideError();

  if (selectedPlatform === "apple") {
    if (!askProfileName()) return;
    const content = buildAppleProfile();
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
    return;
  }

  alert(selectedPlatform === "android" ? tr("androidHelp") : tr("windowsHelp"));
});

applyLanguage();
applyPlatform();
syncUrl();
updateProvider();
updateCustom();
