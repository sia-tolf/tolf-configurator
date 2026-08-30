alert("app.js loaded");
const identityStorageKey = "tolf.ikev2.profile-identities.v2";
const memoryIdentities = {};

let importedProfile = null;
let importedVpnPayloadIndex = -1;
let importedFileBaseName = null;

const onDemandCheckbox = document.getElementById("on-demand");
const alwaysOnCheckbox = document.getElementById("always-on");
const onDemandOptions = document.getElementById("on-demand-options");
const manualRules = document.getElementById("manual-rules");
const alwaysOnHint = document.getElementById("always-on-hint");
const rulesGroup = document.getElementById("rules-group");
const addRuleButton = document.getElementById("add-rule");
const importButton = document.getElementById("import-button");
const importFile = document.getElementById("import-file");
const error = document.getElementById("error");

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function uuid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID().toUpperCase();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
    .toUpperCase();
}

function safeFileName(value) {
  return value
    .trim()
    .replace(/[\/\\:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    || "IKEv2";
}

function normalizeProfileName(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

function baseNameFromImportedFile(fileName) {
  return fileName
    .replace(/\.mobileconfig\.xml$/i, "")
    .replace(/\.mobileconfig$/i, "")
    .replace(/\.xml$/i, "")
    .trim()
    || "IKEv2";
}

function outputBaseName(profileName) {
  return importedFileBaseName
    ? safeFileName(importedFileBaseName)
    : safeFileName(profileName);
}

function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function loadIdentities() {
  try {
    const stored = localStorage.getItem(identityStorageKey);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (e) {}

  return {};
}

function saveIdentities(identities) {
  try {
    localStorage.setItem(identityStorageKey, JSON.stringify(identities));
    return true;
  } catch (e) {
    return false;
  }
}

function getProfileIdentity(name) {
  const key = normalizeProfileName(name);
  const identities = loadIdentities();

  if (identities[key]) return identities[key];
  if (memoryIdentities[key]) return memoryIdentities[key];

  const profileUUID = uuid();
  const vpnUUID = uuid();

  const identity = {
    profileUUID,
    vpnUUID,
    profileIdentifier:
      "is.tolf.configurator.profile." + profileUUID.toLowerCase(),
    vpnIdentifier:
      "is.tolf.configurator.vpn." + vpnUUID.toLowerCase()
  };

  identities[key] = identity;

  if (!saveIdentities(identities)) {
    memoryIdentities[key] = identity;
  }

  return identity;
}

function saveImportedIdentity(name, profile, vpnPayload) {
  if (!name || !profile.PayloadUUID || !vpnPayload.PayloadUUID) return;

  const key = normalizeProfileName(name);

  const identity = {
    profileUUID: profile.PayloadUUID,
    vpnUUID: vpnPayload.PayloadUUID,
    profileIdentifier:
      profile.PayloadIdentifier ||
      "is.tolf.configurator.profile." + profile.PayloadUUID.toLowerCase(),
    vpnIdentifier:
      vpnPayload.PayloadIdentifier ||
      "is.tolf.configurator.vpn." + vpnPayload.PayloadUUID.toLowerCase()
  };

  const identities = loadIdentities();
  identities[key] = identity;

  if (!saveIdentities(identities)) {
    memoryIdentities[key] = identity;
  }
}

function updateOnDemandVisibility() {
  onDemandOptions.classList.toggle("visible", onDemandCheckbox.checked);
  updateAlwaysOnVisibility();
}

function updateAlwaysOnVisibility() {
  if (!onDemandCheckbox.checked) {
    manualRules.classList.remove("visible");
    alwaysOnHint.classList.remove("visible");
    return;
  }

  if (alwaysOnCheckbox.checked) {
    manualRules.classList.remove("visible");
    alwaysOnHint.classList.add("visible");
  } else {
    manualRules.classList.add("visible");
    alwaysOnHint.classList.remove("visible");
  }
}

function createRuleRow(initialValue = "", initialAction = "Disconnect") {
  const row = document.createElement("div");
  row.className = "rule-row";

  const type = document.createElement("select");
  type.className = "rule-type";
  type.innerHTML = `<option value="wifi">Wi-Fi Network</option>`;

  const value = document.createElement("input");
  value.type = "text";
  value.className = "rule-value";
  value.placeholder = "Network name";
  value.value = initialValue;

  const action = document.createElement("select");
  action.className = "rule-action";
  action.innerHTML = `
    <option value="Connect">Connect</option>
    <option value="Disconnect">Disconnect</option>
    <option value="Ignore">Ignore</option>
  `;
  action.value = initialAction;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-rule";
  remove.setAttribute("aria-label", "Remove rule");
  remove.textContent = "×";
  remove.addEventListener("click", () => row.remove());

  row.appendChild(type);
  row.appendChild(value);
  row.appendChild(action);
  row.appendChild(remove);

  rulesGroup.insertBefore(row, addRuleButton);
}

function clearRuleRows() {
  rulesGroup.querySelectorAll(".rule-row").forEach(row => row.remove());
}

function getAdditionalRules() {
  const rules = [];

  rulesGroup.querySelectorAll(".rule-row").forEach(row => {
    const type = row.querySelector(".rule-type").value;
    const value = row.querySelector(".rule-value").value.trim();
    const action = row.querySelector(".rule-action").value;

    if (value) {
      rules.push({ type, value, action });
    }
  });

  return rules;
}

function plistDictToObject(dictNode) {
  const result = {};
  const children = Array.from(dictNode.children);

  for (let i = 0; i < children.length; i += 2) {
    const keyNode = children[i];
    const valueNode = children[i + 1];

    if (!keyNode || keyNode.tagName !== "key" || !valueNode) continue;

    result[keyNode.textContent] = plistNodeToValue(valueNode);
  }

  return result;
}

function plistNodeToValue(node) {
  switch (node.tagName) {
    case "string":
      return node.textContent;

    case "integer":
      return Number(node.textContent);

    case "real":
      return Number(node.textContent);

    case "true":
      return true;

    case "false":
      return false;

    case "array":
      return Array.from(node.children).map(plistNodeToValue);

    case "dict":
      return plistDictToObject(node);

    case "data":
      return {
        __plistType: "data",
        value: node.textContent
      };

    case "date":
      return {
        __plistType: "date",
        value: node.textContent
      };

    default:
      return {
        __plistType: "raw",
        xml: node.outerHTML
      };
  }
}

function indentLines(text, indent) {
  return text
    .split("\n")
    .map(line => indent + line)
    .join("\n");
}

function plistValueToXml(value, indent = "") {
  if (value && typeof value === "object" && value.__plistType === "data") {
    return indent + "<data>" + value.value + "</data>";
  }

  if (value && typeof value === "object" && value.__plistType === "date") {
    return indent + "<date>" + xmlEscape(value.value) + "</date>";
  }

  if (value && typeof value === "object" && value.__plistType === "raw") {
    return indentLines(value.xml, indent);
  }

  if (typeof value === "string") {
    return indent + "<string>" + xmlEscape(value) + "</string>";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return indent + "<integer>" + value + "</integer>";
    }

    return indent + "<real>" + value + "</real>";
  }

  if (typeof value === "boolean") {
    return indent + (value ? "<true/>" : "<false/>");
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return indent + "<array/>";

    const items = value
      .map(item => plistValueToXml(item, indent + "\t"))
      .join("\n");

    return indent + "<array>\n" + items + "\n" + indent + "</array>";
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) return indent + "<dict/>";

    let xml = indent + "<dict>\n";

    entries.forEach((entry, index) => {
      const [key, item] = entry;

      xml +=
        indent +
        "\t<key>" +
        xmlEscape(key) +
        "</key>\n";

      xml += plistValueToXml(item, indent + "\t");

      if (index < entries.length - 1) {
        xml += "\n";
      }
    });

    xml += "\n" + indent + "</dict>";
    return xml;
  }

  return indent + "<string></string>";
}

function profileToXml(profile) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${plistValueToXml(profile)}
</plist>`;
}

function findIkev2PayloadIndex(profile) {
  if (!profile || !Array.isArray(profile.PayloadContent)) return -1;

  return profile.PayloadContent.findIndex(payload =>
    payload &&
    payload.PayloadType === "com.apple.vpn.managed" &&
    payload.VPNType === "IKEv2" &&
    payload.IKEv2
  );
}

function applyImported |oai:code-citation|
