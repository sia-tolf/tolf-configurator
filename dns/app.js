const providers={
  quad9:{name:"Quad9",protocol:"HTTPS",url:"https://dns.quad9.net/dns-query"},
  cloudflare:{name:"Cloudflare",protocol:"HTTPS",url:"https://cloudflare-dns.com/dns-query"},
  yandex:{name:"Yandex DNS",protocol:"HTTPS",url:"https://common.dot.dns.yandex.net/dns-query"},
  dns4eu:{name:"DNS4EU",protocol:"HTTPS",url:"https://unfiltered.joindns4.eu/dns-query"}
};
const I={
 en:{subtitle:"Create a DNS configuration profile directly in your browser.",providerMode:"Provider",customMode:"Custom DNS",provider:"DNS provider",protocol:"Protocol",endpoint:"Endpoint",plainDns:"DNS (unencrypted)",dohUrl:"DoH URL",dotHost:"DoT server name",addresses:"DNS addresses",addressesHint:"Enter IPv4 or IPv6 addresses separated by commas or new lines.",profileName:"Profile name",install:"Install Profile",share:"Share Profile",privateTitle:"Processed locally",privateText:"DNS settings and generated profiles stay in this browser and are not sent to TOLF.",invalidUrl:"Enter a valid HTTPS DoH URL.",invalidHost:"Enter a DoT server name.",invalidAddresses:"Enter at least one DNS address.",nameRequired:"Enter a profile name."},
 ru:{subtitle:"Создавайте профиль DNS прямо в браузере.",providerMode:"Провайдер",customMode:"Свой DNS",provider:"DNS-провайдер",protocol:"Протокол",endpoint:"Адрес",plainDns:"DNS (без шифрования)",dohUrl:"Адрес DoH",dotHost:"Имя сервера DoT",addresses:"Адреса DNS",addressesHint:"Введите адреса IPv4 или IPv6 через запятую или с новой строки.",profileName:"Название профиля",install:"Установить профиль",share:"Поделиться профилем",privateTitle:"Обрабатывается локально",privateText:"Настройки DNS и создаваемый профиль остаются в браузере и не отправляются в TOLF.",invalidUrl:"Введите корректный HTTPS-адрес DoH.",invalidHost:"Введите имя сервера DoT.",invalidAddresses:"Введите хотя бы один адрес DNS.",nameRequired:"Введите название профиля."},
 lv:{subtitle:"Izveidojiet DNS konfigurācijas profilu tieši pārlūkprogrammā.",providerMode:"Pakalpojuma sniedzējs",customMode:"Savs DNS",provider:"DNS pakalpojuma sniedzējs",protocol:"Protokols",endpoint:"Adrese",plainDns:"DNS (nešifrēts)",dohUrl:"DoH adrese",dotHost:"DoT servera nosaukums",addresses:"DNS adreses",addressesHint:"Ievadiet IPv4 vai IPv6 adreses, atdalot tās ar komatiem vai jaunām rindām.",profileName:"Profila nosaukums",install:"Instalēt profilu",share:"Kopīgot profilu",privateTitle:"Apstrāde notiek lokāli",privateText:"DNS iestatījumi un izveidotais profils paliek pārlūkprogrammā un netiek nosūtīti TOLF.",invalidUrl:"Ievadiet derīgu HTTPS DoH adresi.",invalidHost:"Ievadiet DoT servera nosaukumu.",invalidAddresses:"Ievadiet vismaz vienu DNS adresi.",nameRequired:"Ievadiet profila nosaukumu."}
};
const supported=["en","ru","lv"];
const q=new URL(location.href).searchParams.get("lang");
const saved=localStorage.getItem("tolf-language");
let lang=supported.includes(q)?q:supported.includes(saved)?saved:(navigator.language||"en").toLowerCase().startsWith("ru")?"ru":(navigator.language||"en").toLowerCase().startsWith("lv")?"lv":"en";
const $=id=>document.getElementById(id);
const provider=$("provider"),providerProtocol=$("providerProtocol"),providerEndpoint=$("providerEndpoint"),providerPanel=$("providerPanel"),customPanel=$("customPanel"),customProtocol=$("customProtocol"),urlField=$("urlField"),hostField=$("hostField"),addressesField=$("addressesField"),error=$("error");
let mode="provider";
function tr(k){return I[lang][k]||I.en[k]||k}
function applyLanguage(){document.documentElement.lang=lang;document.querySelectorAll("[data-t]").forEach(x=>x.textContent=tr(x.dataset.t));document.querySelectorAll("[data-lang]").forEach(x=>x.classList.toggle("active",x.dataset.lang===lang));const back=document.querySelector(".back");if(back)back.href="/?lang="+encodeURIComponent(lang)}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("tolf-language",lang);const u=new URL(location.href);u.searchParams.set("lang",lang);history.replaceState(null,"",u);applyLanguage()});
document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x===b));providerPanel.classList.toggle("hidden",mode!=="provider");customPanel.classList.toggle("hidden",mode!=="custom");hideError()});
function updateProvider(){const p=providers[provider.value];providerProtocol.textContent=p.protocol==="HTTPS"?"DoH":"DoT";providerEndpoint.textContent=p.url;$("profileName").value=p.name+" DNS"}
provider.onchange=updateProvider;
function updateCustom(){const p=customProtocol.value;urlField.classList.toggle("hidden",p!=="HTTPS");hostField.classList.toggle("hidden",p!=="TLS");addressesField.classList.toggle("hidden",p==="HTTPS")}
customProtocol.onchange=updateCustom;
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;")}
function uuid(){return crypto.randomUUID().toUpperCase()}
function addresses(){return $("serverAddresses").value.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean)}
function validate(){
 const name=$("profileName").value.trim(); if(!name)return tr("nameRequired");
 if(mode==="provider")return null;
 if(customProtocol.value==="HTTPS"){try{const u=new URL($("serverUrl").value.trim());if(u.protocol!=="https:")throw 0}catch{return tr("invalidUrl")}}
 if(customProtocol.value==="TLS"&&!$("serverName").value.trim())return tr("invalidHost");
 if(customProtocol.value!=="HTTPS"&&!addresses().length)return tr("invalidAddresses");
 return null
}
function hideError(){error.classList.add("hidden")}
function build(){
 const e=validate();if(e){error.textContent=e;error.classList.remove("hidden");return null}hideError();
 const name=$("profileName").value.trim(),pu=uuid(),du=uuid();let settings="";
 if(mode==="provider"){const p=providers[provider.value];settings=`<key>DNSProtocol</key><string>HTTPS</string><key>ServerURL</key><string>${esc(p.url)}</string>`}
 else if(customProtocol.value==="HTTPS")settings=`<key>DNSProtocol</key><string>HTTPS</string><key>ServerURL</key><string>${esc($("serverUrl").value.trim())}</string>`;
 else {const p=customProtocol.value;settings=`<key>DNSProtocol</key><string>${p}</string>${p==="TLS"?`<key>ServerName</key><string>${esc($("serverName").value.trim())}</string>`:""}<key>ServerAddresses</key><array>${addresses().map(x=>`<string>${esc(x)}</string>`).join("")}</array>`}
 return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>PayloadContent</key><array><dict><key>DNSSettings</key><dict>${settings}</dict><key>PayloadDisplayName</key><string>${esc(name)}</string><key>PayloadIdentifier</key><string>is.tolf.configurator.dns.settings.${du.toLowerCase()}</string><key>PayloadType</key><string>com.apple.dnsSettings.managed</string><key>PayloadUUID</key><string>${du}</string><key>PayloadVersion</key><integer>1</integer></dict></array><key>PayloadDescription</key><string>DNS configuration generated locally by TOLF Configurator.</string><key>PayloadDisplayName</key><string>${esc(name)}</string><key>PayloadIdentifier</key><string>is.tolf.configurator.dns.profile.${pu.toLowerCase()}</string><key>PayloadOrganization</key><string>TOLF Configurator</string><key>PayloadRemovalDisallowed</key><false/><key>PayloadType</key><string>Configuration</string><key>PayloadUUID</key><string>${pu}</string><key>PayloadVersion</key><integer>1</integer></dict></plist>`
}
function fileName(){return ($("profileName").value.trim()||"DNS").replace(/[^\p{L}\p{N}._-]+/gu,"-")+".mobileconfig"}
function download(content){const blob=new Blob([content],{type:"application/x-apple-aspen-config"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=fileName();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$("install").onclick=()=>{const x=build();if(x)download(x)};
$("share").onclick=async()=>{const x=build();if(!x)return;const file=new File([x],fileName(),{type:"application/x-apple-aspen-config"});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});return}catch(e){if(e.name==="AbortError")return}}download(x)};
applyLanguage();updateProvider();updateCustom();