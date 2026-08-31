// Tolf Configurator IKEv2 — Build 2026-08-31.2

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

const installProfileButton = document.getElementById("install-profile");
const saveProfileButton = document.getElementById("save-profile");
const saveStrongSwanButton = document.getElementById("save-strongswan");

const runningOnWindows =
  /Windows/i.test(navigator.userAgent);

function updatePlatformActions() {
  if (runningOnWindows) {
    installProfileButton.disabled = true;
    installProfileButton.setAttribute("aria-disabled", "true");
    installProfileButton.title =
      "Apple configuration profiles cannot be installed directly on Windows.";

    saveProfileButton.textContent =
      "Save Profile";

    saveStrongSwanButton.textContent =
      "Save strongSwan";
  } else {
    installProfileButton.disabled = false;
    installProfileButton.removeAttribute("aria-disabled");
    installProfileButton.removeAttribute("title");

    saveProfileButton.textContent =
      "Share Profile";

    saveStrongSwanButton.textContent =
      "Share strongSwan";
  }
}

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

      return v
        .toString(16);
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

  return JSON.parse(
    JSON.stringify(value)
  );
}

function loadIdentities() {
  try {
    const stored =
      localStorage.getItem(identityStorageKey);

    if (!stored) {
      return {};
    }

    const parsed =
      JSON.parse(stored);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }
  } catch (e) {}

  return {};
}

function saveIdentities(identities) {
  try {
    localStorage.setItem(
      identityStorageKey,
      JSON.stringify(identities)
    );

    return true;
  } catch (e) {
    return false;
  }
}

function getProfileIdentity(name) {
  const key =
    normalizeProfileName(name);

  const identities =
    loadIdentities();

  if (identities[key]) {
    return identities[key];
  }

  if (memoryIdentities[key]) {
    return memoryIdentities[key];
  }

  const profileUUID = uuid();
  const vpnUUID = uuid();

  const identity = {
    profileUUID,
    vpnUUID,

    profileIdentifier:
      "is.tolf.configurator.profile." +
      profileUUID.toLowerCase(),

    vpnIdentifier:
      "is.tolf.configurator.vpn." +
      vpnUUID.toLowerCase()
  };

  identities[key] =
    identity;

  if (!saveIdentities(identities)) {
    memoryIdentities[key] =
      identity;
  }

  return identity;
}

function saveImportedIdentity(
  name,
  profile,
  vpnPayload
) {
  if (
    !name ||
    !profile.PayloadUUID ||
    !vpnPayload.PayloadUUID
  ) {
    return;
  }

  const key =
    normalizeProfileName(name);

  const identity = {
    profileUUID:
      profile.PayloadUUID,

    vpnUUID:
      vpnPayload.PayloadUUID,

    profileIdentifier:
      profile.PayloadIdentifier ||
      "is.tolf.configurator.profile." +
      profile.PayloadUUID.toLowerCase(),

    vpnIdentifier:
      vpnPayload.PayloadIdentifier ||
      "is.tolf.configurator.vpn." +
      vpnPayload.PayloadUUID.toLowerCase()
  };

  const identities =
    loadIdentities();

  identities[key] =
    identity;

  if (!saveIdentities(identities)) {
    memoryIdentities[key] =
      identity;
  }
}

function updateOnDemandVisibility() {
  onDemandOptions.classList.toggle(
    "visible",
    onDemandCheckbox.checked
  );

  updateAlwaysOnVisibility();
}

function updateAlwaysOnVisibility() {
  if (!onDemandCheckbox.checked) {
    manualRules.classList.remove(
      "visible"
    );

    alwaysOnHint.classList.remove(
      "visible"
    );

    return;
  }

  if (alwaysOnCheckbox.checked) {
    manualRules.classList.remove(
      "visible"
    );

    alwaysOnHint.classList.add(
      "visible"
    );
  } else {
    manualRules.classList.add(
      "visible"
    );

    alwaysOnHint.classList.remove(
      "visible"
    );
  }
}

function createRuleRow(
  initialValue = "",
  initialAction = "Disconnect"
) {
  const row =
    document.createElement("div");

  row.className =
    "rule-row";

  const type =
    document.createElement("select");

  type.className =
    "rule-type";

  type.innerHTML =
    `<option value="wifi">Wi-Fi Network</option>`;

  const value =
    document.createElement("input");

  value.type =
    "text";

  value.className =
    "rule-value";

  value.placeholder =
    "Network name";

  value.value =
    initialValue;

  const action =
    document.createElement("select");

  action.className =
    "rule-action";

  action.innerHTML = `
    <option value="Connect">Connect</option>
    <option value="Disconnect">Disconnect</option>
    <option value="Ignore">Ignore</option>
  `;

  action.value =
    initialAction;

  const remove =
    document.createElement("button");

  remove.type =
    "button";

  remove.className =
    "remove-rule";

  remove.setAttribute(
    "aria-label",
    "Remove rule"
  );

  remove.textContent =
    "×";

  remove.addEventListener(
    "click",
    () => row.remove()
  );

  row.appendChild(type);
  row.appendChild(value);
  row.appendChild(action);
  row.appendChild(remove);

  rulesGroup.insertBefore(
    row,
    addRuleButton
  );
}

function clearRuleRows() {
  rulesGroup
    .querySelectorAll(".rule-row")
    .forEach(
      row => row.remove()
    );
}

function getAdditionalRules() {
  const rules = [];

  rulesGroup
    .querySelectorAll(".rule-row")
    .forEach(row => {
      const type =
        row.querySelector(
          ".rule-type"
        ).value;

      const value =
        row.querySelector(
          ".rule-value"
        ).value.trim();

      const action =
        row.querySelector(
          ".rule-action"
        ).value;

      if (value) {
        rules.push({
          type,
          value,
          action
        });
      }
    });

  return rules;
}

function plistDictToObject(dictNode) {
  const result = {};

  const children =
    Array.from(
      dictNode.children
    );

  for (
    let i = 0;
    i < children.length;
    i += 2
  ) {
    const keyNode =
      children[i];

    const valueNode =
      children[i + 1];

    if (
      !keyNode ||
      keyNode.tagName !== "key" ||
      !valueNode
    ) {
      continue;
    }

    result[keyNode.textContent] =
      plistNodeToValue(
        valueNode
      );
  }

  return result;
}

function plistNodeToValue(node) {
  switch (node.tagName) {
    case "string":
      return node.textContent;

    case "integer":
      return Number(
        node.textContent
      );

    case "real":
      return Number(
        node.textContent
      );

    case "true":
      return true;

    case "false":
      return false;

    case "array":
      return Array
        .from(node.children)
        .map(plistNodeToValue);

    case "dict":
      return plistDictToObject(
        node
      );

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

function indentLines(
  text,
  indent
) {
  return text
    .split("\n")
    .map(
      line =>
        indent + line
    )
    .join("\n");
}

function plistValueToXml(
  value,
  indent = ""
) {
  if (
    value &&
    typeof value === "object" &&
    value.__plistType === "data"
  ) {
    return (
      indent +
      "<data>" +
      value.value +
      "</data>"
    );
  }

  if (
    value &&
    typeof value === "object" &&
    value.__plistType === "date"
  ) {
    return (
      indent +
      "<date>" +
      xmlEscape(value.value) +
      "</date>"
    );
  }

  if (
    value &&
    typeof value === "object" &&
    value.__plistType === "raw"
  ) {
    return indentLines(
      value.xml,
      indent
    );
  }

  if (
    typeof value === "string"
  ) {
    return (
      indent +
      "<string>" +
      xmlEscape(value) +
      "</string>"
    );
  }

  if (
    typeof value === "number"
  ) {
    if (
      Number.isInteger(value)
    ) {
      return (
        indent +
        "<integer>" +
        value +
        "</integer>"
      );
    }

    return (
      indent +
      "<real>" +
      value +
      "</real>"
    );
  }

  if (
    typeof value === "boolean"
  ) {
    return (
      indent +
      (
        value
          ? "<true/>"
          : "<false/>"
      )
    );
  }

  if (
    Array.isArray(value)
  ) {
    if (
      value.length === 0
    ) {
      return (
        indent +
        "<array/>"
      );
    }

    const items =
      value
        .map(
          item =>
            plistValueToXml(
              item,
              indent + "\t"
            )
        )
        .join("\n");

    return (
      indent +
      "<array>\n" +
      items +
      "\n" +
      indent +
      "</array>"
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const entries =
      Object.entries(value);

    if (
      entries.length === 0
    ) {
      return (
        indent +
        "<dict/>"
      );
    }

    let xml =
      indent +
      "<dict>\n";

    entries.forEach(
      (entry, index) => {
        const [
          key,
          item
        ] = entry;

        xml +=
          indent +
          "\t<key>" +
          xmlEscape(key) +
          "</key>\n";

        xml +=
          plistValueToXml(
            item,
            indent + "\t"
          );

        if (
          index <
          entries.length - 1
        ) {
          xml += "\n";
        }
      }
    );

    xml +=
      "\n" +
      indent +
      "</dict>";

    return xml;
  }

  return (
    indent +
    "<string></string>"
  );
}

function profileToXml(profile) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${plistValueToXml(profile)}
</plist>`;
}

function findIkev2PayloadIndex(profile) {
  if (
    !profile ||
    !Array.isArray(
      profile.PayloadContent
    )
  ) {
    return -1;
  }

  return profile
    .PayloadContent
    .findIndex(
      payload =>
        payload &&
        payload.PayloadType ===
          "com.apple.vpn.managed" &&
        payload.VPNType ===
          "IKEv2" &&
        payload.IKEv2
    );
}

function applyImportedProfile(
  profile,
  vpnPayload
) {
  const ikev2 =
    vpnPayload.IKEv2 || {};

  const ikeSecurity =
    ikev2
      .IKESecurityAssociationParameters ||
    {};

  document
    .getElementById("name")
    .value =
      vpnPayload.UserDefinedName ||
      vpnPayload.PayloadDisplayName ||
      profile.PayloadDisplayName ||
      "IKEv2";

  document
    .getElementById("server")
    .value =
      ikev2.RemoteAddress ||
      "";

  document
    .getElementById("remote-id")
    .value =
      ikev2.RemoteIdentifier ||
      "";

  document
    .getElementById("local-id")
    .value =
      ikev2.LocalIdentifier ||
      "";

  document
    .getElementById("username")
    .value =
      ikev2.AuthName ||
      "";

  document
    .getElementById("password")
    .value =
      ikev2.AuthPassword ||
      "";

  if (
    ["AES-128", "AES-256"]
      .includes(
        ikeSecurity
          .EncryptionAlgorithm
      )
  ) {
    document
      .getElementById(
        "ike-encryption"
      )
      .value =
        ikeSecurity
          .EncryptionAlgorithm;
  }

  if (
    [
      "SHA2-256",
      "SHA2-384",
      "SHA2-512"
    ].includes(
      ikeSecurity
        .IntegrityAlgorithm
    )
  ) {
    document
      .getElementById(
        "ike-integrity"
      )
      .value =
        ikeSecurity
          .IntegrityAlgorithm;
  }

  if (
    [14, 19, 20]
      .includes(
        Number(
          ikeSecurity
            .DiffieHellmanGroup
        )
      )
  ) {
    document
      .getElementById(
        "dh-group"
      )
      .value =
        String(
          ikeSecurity
            .DiffieHellmanGroup
        );
  }

  if (
    [
      "None",
      "Low",
      "Medium",
      "High"
    ].includes(
      ikev2
        .DeadPeerDetectionRate
    )
  ) {
    document
      .getElementById("dpd")
      .value =
        ikev2
          .DeadPeerDetectionRate;
  }

  document
    .getElementById("pfs")
    .checked =
      Number(
        ikev2.EnablePFS || 0
      ) === 1;

  document
    .getElementById("mobike")
    .checked =
      Number(
        ikev2.DisableMOBIKE || 0
      ) !== 1;

  document
    .getElementById("redirects")
    .checked =
      Number(
        ikev2.DisableRedirect || 0
      ) !== 1;

  document
    .getElementById(
      "internal-subnet"
    )
    .checked =
      Number(
        ikev2
          .UseConfigurationAttributeInternalIPSubnet ||
        0
      ) === 1;

  clearRuleRows();

  const onDemandEnabled =
    Number(
      ikev2.OnDemandEnabled ||
      0
    ) === 1;

  onDemandCheckbox.checked =
    onDemandEnabled;

  let alwaysOn = false;
  let wifiDefault = "Connect";
  let cellularDefault = "Connect";

  const rules =
    Array.isArray(
      ikev2.OnDemandRules
    )
      ? ikev2.OnDemandRules
      : [];

  if (
    onDemandEnabled &&
    rules.length === 1 &&
    rules[0] &&
    rules[0].Action ===
      "Connect" &&
    !rules[0]
      .InterfaceTypeMatch &&
    !rules[0]
      .SSIDMatch
  ) {
    alwaysOn = true;
  } else {
    rules.forEach(rule => {
      if (!rule) {
        return;
      }

      if (
        rule
          .InterfaceTypeMatch ===
          "WiFi" &&
        Array.isArray(
          rule.SSIDMatch
        )
      ) {
        rule
          .SSIDMatch
          .forEach(ssid => {
            createRuleRow(
              ssid,
              rule.Action ||
              "Disconnect"
            );
          });

        return;
      }

      if (
        rule
          .InterfaceTypeMatch ===
          "WiFi" &&
        !rule.SSIDMatch
      ) {
        wifiDefault =
          rule.Action ||
          "Connect";

        return;
      }

      if (
        rule
          .InterfaceTypeMatch ===
        "Cellular"
      ) {
        cellularDefault =
          rule.Action ||
          "Connect";
      }
    });
  }

  alwaysOnCheckbox.checked =
    alwaysOn;

  document
    .getElementById(
      "wifi-action"
    )
    .value =
      [
        "Connect",
        "Disconnect",
        "Ignore"
      ].includes(wifiDefault)
        ? wifiDefault
        : "Connect";

  document
    .getElementById(
      "cellular-action"
    )
    .value =
      [
        "Connect",
        "Disconnect",
        "Ignore"
      ].includes(
        cellularDefault
      )
        ? cellularDefault
        : "Connect";

  updateOnDemandVisibility();
}

function buildOnDemandRules() {
  if (
    !onDemandCheckbox.checked
  ) {
    return null;
  }

  if (
    alwaysOnCheckbox.checked
  ) {
    return [
      {
        Action: "Connect"
      }
    ];
  }

  const rules = [];

  getAdditionalRules()
    .forEach(rule => {
      if (
        rule.type === "wifi"
      ) {
        rules.push({
          Action:
            rule.action,

          InterfaceTypeMatch:
            "WiFi",

          SSIDMatch:
            [rule.value]
        });
      }
    });

  rules.push({
    Action:
      document
        .getElementById(
          "wifi-action"
        )
        .value,

    InterfaceTypeMatch:
      "WiFi"
  });

  rules.push({
    Action:
      document
        .getElementById(
          "cellular-action"
        )
        .value,

    InterfaceTypeMatch:
      "Cellular"
  });

  rules.push({
    Action: "Ignore"
  });

  return rules;
}

function updateImportedProfile(
  profile,
  vpnPayloadIndex,
  values
) {
  const output =
    deepClone(profile);

  const vpnPayload =
    output
      .PayloadContent[
        vpnPayloadIndex
      ];

  const ikev2 =
    vpnPayload.IKEv2;

  output.PayloadDisplayName =
    values.name;

  vpnPayload.PayloadDisplayName =
    values.name;

  vpnPayload.UserDefinedName =
    values.name;

  ikev2.RemoteAddress =
    values.server;

  ikev2.RemoteIdentifier =
    values.remoteId;

  if (
    values.localId
  ) {
    ikev2.LocalIdentifier =
      values.localId;
  } else {
    delete ikev2.LocalIdentifier;
  }

  ikev2.AuthName =
    values.username;

  if (
    values.password
  ) {
    ikev2.AuthPassword =
      values.password;
  } else {
    delete ikev2.AuthPassword;
  }

  ikev2.DeadPeerDetectionRate =
    values.dpd;

  ikev2.EnablePFS =
    values.pfs
      ? 1
      : 0;

  ikev2.DisableMOBIKE =
    values.mobike
      ? 0
      : 1;

  ikev2.DisableRedirect =
    values.redirects
      ? 0
      : 1;

  if (
    Object.prototype
      .hasOwnProperty
      .call(
        ikev2,
        "UseConfigurationAttributeInternalIPSubnet"
      ) ||
    values.internalSubnet
  ) {
    ikev2
      .UseConfigurationAttributeInternalIPSubnet =
        values.internalSubnet
          ? 1
          : 0;
  }

  if (
    !ikev2
      .IKESecurityAssociationParameters
  ) {
    ikev2
      .IKESecurityAssociationParameters =
        {};
  }

  const ikeSecurity =
    ikev2
      .IKESecurityAssociationParameters;

  ikeSecurity
    .EncryptionAlgorithm =
      values.encryption;

  ikeSecurity
    .IntegrityAlgorithm =
      values.integrity;

  ikeSecurity
    .DiffieHellmanGroup =
      Number(
        values.dhGroup
      );

  if (
    ikev2
      .ChildSecurityAssociationParameters
  ) {
    const child =
      ikev2
        .ChildSecurityAssociationParameters;

    child
      .EncryptionAlgorithm =
        values.encryption;

    child
      .IntegrityAlgorithm =
        values.integrity;

    if (
      Object.prototype
        .hasOwnProperty
        .call(
          child,
          "DiffieHellmanGroup"
        )
    ) {
      child
        .DiffieHellmanGroup =
          Number(
            values.dhGroup
          );
    }
  } else {
    ikev2
      .ChildSecurityAssociationParameters =
        {
          EncryptionAlgorithm:
            values.encryption,

          IntegrityAlgorithm:
            values.integrity
        };
  }

  if (
    values.onDemand
  ) {
    ikev2.OnDemandEnabled =
      1;

    ikev2.OnDemandRules =
      values.onDemandRules;
  } else {
    if (
      Object.prototype
        .hasOwnProperty
        .call(
          ikev2,
          "OnDemandEnabled"
        )
    ) {
      ikev2.OnDemandEnabled =
        0;
    }

    delete ikev2.OnDemandRules;
  }

  return output;
}

function buildNewProfile(values) {
  const identity =
    getProfileIdentity(
      values.name
    );

  const ikev2 = {
    RemoteAddress:
      values.server,

    RemoteIdentifier:
      values.remoteId,

    AuthenticationMethod:
      "None",

    ExtendedAuthEnabled:
      1,

    AuthName:
      values.username,

    DeadPeerDetectionRate:
      values.dpd,

    EnablePFS:
      values.pfs
        ? 1
        : 0,

    DisableMOBIKE:
      values.mobike
        ? 0
        : 1,

    DisableRedirect:
      values.redirects
        ? 0
        : 1,

    UseConfigurationAttributeInternalIPSubnet:
      values.internalSubnet
        ? 1
        : 0
  };

  if (
    values.localId
  ) {
    ikev2.LocalIdentifier =
      values.localId;
  }

  if (
    values.password
  ) {
    ikev2.AuthPassword =
      values.password;
  }

  if (
    values.onDemand
  ) {
    ikev2.OnDemandEnabled =
      1;

    ikev2.OnDemandRules =
      values.onDemandRules;
  } else {
    ikev2.OnDemandEnabled =
      0;
  }

  ikev2
    .IKESecurityAssociationParameters =
      {
        EncryptionAlgorithm:
          values.encryption,

        IntegrityAlgorithm:
          values.integrity,

        DiffieHellmanGroup:
          Number(
            values.dhGroup
          ),

        LifeTimeInMinutes:
          1440
      };

  ikev2
    .ChildSecurityAssociationParameters =
      {
        EncryptionAlgorithm:
          values.encryption,

        IntegrityAlgorithm:
          values.integrity,

        DiffieHellmanGroup:
          Number(
            values.dhGroup
          ),

        LifeTimeInMinutes:
          1440
      };

  return {
    PayloadContent: [
      {
        PayloadDescription:
          "Configures an IKEv2 VPN connection.",

        PayloadDisplayName:
          values.name,

        PayloadIdentifier:
          identity
            .vpnIdentifier,

        PayloadType:
          "com.apple.vpn.managed",

        PayloadUUID:
          identity
            .vpnUUID,

        PayloadVersion:
          1,

        UserDefinedName:
          values.name,

        VPNType:
          "IKEv2",

        IKEv2:
          ikev2
      }
    ],

    PayloadDisplayName:
      values.name,

    PayloadDescription:
      "IKEv2 configuration profile generated by Tolf Configurator.",

    PayloadIdentifier:
      identity
        .profileIdentifier,

    PayloadOrganization:
      "Tolf Configurator",

    PayloadRemovalDisallowed:
      false,

    PayloadType:
      "Configuration",

    PayloadUUID:
      identity
        .profileUUID,

    PayloadVersion:
      1
  };
}

function collectValues() {
  return {
    name:
      document
        .getElementById("name")
        .value
        .trim(),

    server:
      document
        .getElementById("server")
        .value
        .trim(),

    remoteId:
      document
        .getElementById("remote-id")
        .value
        .trim(),

    localId:
      document
        .getElementById("local-id")
        .value
        .trim(),

    username:
      document
        .getElementById("username")
        .value
        .trim(),

    password:
      document
        .getElementById("password")
        .value,

    encryption:
      document
        .getElementById(
          "ike-encryption"
        )
        .value,

    integrity:
      document
        .getElementById(
          "ike-integrity"
        )
        .value,

    dhGroup:
      document
        .getElementById(
          "dh-group"
        )
        .value,

    dpd:
      document
        .getElementById("dpd")
        .value,

    pfs:
      document
        .getElementById("pfs")
        .checked,

    mobike:
      document
        .getElementById("mobike")
        .checked,

    redirects:
      document
        .getElementById(
          "redirects"
        )
        .checked,

    internalSubnet:
      document
        .getElementById(
          "internal-subnet"
        )
        .checked,

    onDemand:
      onDemandCheckbox.checked,

    onDemandRules:
      buildOnDemandRules()
  };
}

function validateValues(values) {
  if (
    !values.name ||
    !values.server ||
    !values.remoteId ||
    !values.username
  ) {
    error.textContent =
      "Name, Server, Remote ID and Username are required.";

    error.style.display =
      "block";

    return false;
  }

  error.style.display =
    "none";

  return true;
}

function createOutputProfile() {
  const values =
    collectValues();

  if (
    !validateValues(values)
  ) {
    return null;
  }

  let outputProfile;

  if (
    importedProfile &&
    importedVpnPayloadIndex >= 0
  ) {
    outputProfile =
      updateImportedProfile(
        importedProfile,
        importedVpnPayloadIndex,
        values
      );

    const outputVpnPayload =
      outputProfile
        .PayloadContent[
          importedVpnPayloadIndex
        ];

    saveImportedIdentity(
      values.name,
      outputProfile,
      outputVpnPayload
    );
  } else {
    outputProfile =
      buildNewProfile(
        values
      );
  }

  return {
    profile:
      outputProfile,

    values,

    xml:
      profileToXml(
        outputProfile
      )
  };
}

function strongSwanEncryption(value) {
  const map = {
    "AES-128": "aes128",
    "AES-256": "aes256"
  };

  return map[value] ||
    "aes256";
}

function strongSwanIntegrity(value) {
  const map = {
    "SHA2-256": "sha256",
    "SHA2-384": "sha384",
    "SHA2-512": "sha512"
  };

  return map[value] ||
    "sha256";
}

function strongSwanDhGroup(value) {
  const map = {
    "14": "modp2048",
    "19": "ecp256",
    "20": "ecp384"
  };

  return map[
    String(value)
  ] || "modp2048";
}

function buildStrongSwanProfile(values) {
  const encryption =
    strongSwanEncryption(
      values.encryption
    );

  const integrity =
    strongSwanIntegrity(
      values.integrity
    );

  const dh =
    strongSwanDhGroup(
      values.dhGroup
    );

  const identity =
    getProfileIdentity(
      values.name
    );

  const profile = {
    uuid:
      identity
        .vpnUUID
        .toLowerCase(),

    name:
      values.name,

    type:
      "ikev2-eap",

    remote: {
      addr:
        values.server,

      id:
        values.remoteId
    },

    local: {
      eap_id:
        values.username
    },

    "ike-proposal":
      encryption +
      "-" +
      integrity +
      "-" +
      dh,

    "esp-proposal":
      encryption +
      "-" +
      integrity +
      (
        values.pfs
          ? "-" + dh
          : ""
      )
  };

  if (
    values.localId
  ) {
    profile.local.id =
      values.localId;
  }

  if (
    values.password
  ) {
    profile
      .local
      .shared_secret =
        values.password;
  }

  return profile;
}

function createStrongSwanOutput() {
  const values =
    collectValues();

  if (
    !validateValues(values)
  ) {
    return null;
  }

  const profile =
    buildStrongSwanProfile(
      values
    );

  return {
    profile,

    values,

    json:
      JSON.stringify(
        profile,
        null,
        2
      ) + "\n"
  };
}

function downloadBlob(
  content,
  type,
  fileName
) {
  const blob =
    new Blob(
      [content],
      { type }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    fileName;

  document.body
    .appendChild(link);

  link.click();

  link.remove();

  setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );
}

async function shareOrSaveFile(
  content,
  fileName,
  type
) {
  if (
    runningOnWindows
  ) {
    downloadBlob(
      content,
      type,
      fileName
    );

    return;
  }

  const file =
    new File(
      [content],
      fileName,
      { type }
    );

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({
      files: [file]
    })
  ) {
    try {
      await navigator.share({
        files: [file]
      });

      return;
    } catch (shareError) {
      if (
        shareError.name ===
        "AbortError"
      ) {
        return;
      }
    }
  }

  downloadBlob(
    content,
    type,
    fileName
  );
}

async function saveProfileThroughShare(output) {
  await shareOrSaveFile(
    output.xml,

    outputBaseName(
      output.values.name
    ) +
      ".mobileconfig",

    "application/x-apple-aspen-config"
  );
}

async function saveStrongSwanThroughShare(output) {
  await shareOrSaveFile(
    output.json,

    outputBaseName(
      output.values.name
    ) +
      ".sswan",

    "application/vnd.strongswan.profile"
  );
}

importButton.addEventListener(
  "click",
  function() {
    importFile.value =
      "";

    importFile.click();
  }
);

importFile.addEventListener(
  "change",
  async function() {
    const file =
      importFile.files[0];

    if (!file) {
      return;
    }

    importedFileBaseName =
      baseNameFromImportedFile(
        file.name
      );

    try {
      const text =
        await file.text();

      const parser =
        new DOMParser();

      const xml =
        parser.parseFromString(
          text,
          "application/xml"
        );

      if (
        xml.querySelector(
          "parsererror"
        )
      ) {
        throw new Error(
          "The selected file is not a valid XML configuration profile."
        );
      }

      const plist =
        xml.querySelector(
          "plist"
        );

      if (!plist) {
        throw new Error(
          "The selected file is not a valid Apple configuration profile."
        );
      }

      const topDict =
        Array
          .from(
            plist.children
          )
          .find(
            node =>
              node.tagName ===
              "dict"
          );

      if (!topDict) {
        throw new Error(
          "The configuration profile does not contain a valid payload."
        );
      }

      const profile =
        plistDictToObject(
          topDict
        );

      const vpnIndex =
        findIkev2PayloadIndex(
          profile
        );

      if (
        vpnIndex < 0
      ) {
        throw new Error(
          "No IKEv2 VPN configuration was found in this profile."
        );
      }

      const vpnPayload =
        profile
          .PayloadContent[
            vpnIndex
          ];

      importedProfile =
        deepClone(
          profile
        );

      importedVpnPayloadIndex =
        vpnIndex;

      applyImportedProfile(
        profile,
        vpnPayload
      );

      const importedName =
        document
          .getElementById(
            "name"
          )
          .value
          .trim();

      saveImportedIdentity(
        importedName,
        profile,
        vpnPayload
      );

      error.style.display =
        "none";

      const originalText =
        importButton
          .textContent;

      importButton.textContent =
        "Profile Imported";

      setTimeout(
        () => {
          importButton.textContent =
            originalText;
        },
        1600
      );
    } catch (importError) {
      importedProfile =
        null;

      importedVpnPayloadIndex =
        -1;

      importedFileBaseName =
        null;

      error.textContent =
        importError.message ||
        "The profile could not be imported.";

      error.style.display =
        "block";
    }
  }
);

onDemandCheckbox.addEventListener(
  "change",
  updateOnDemandVisibility
);

alwaysOnCheckbox.addEventListener(
  "change",
  updateAlwaysOnVisibility
);

addRuleButton.addEventListener(
  "click",
  function() {
    createRuleRow();
  }
);

updateOnDemandVisibility();
updatePlatformActions();

installProfileButton.addEventListener(
  "click",
  function() {
    if (
      runningOnWindows
    ) {
      return;
    }

    const output =
      createOutputProfile();

    if (!output) {
      return;
    }

    downloadBlob(
      output.xml,

      "application/x-apple-aspen-config",

      outputBaseName(
        output.values.name
      ) +
        ".mobileconfig"
    );
  }
);

saveProfileButton.addEventListener(
  "click",
  async function() {
    const output =
      createOutputProfile();

    if (!output) {
      return;
    }

    await saveProfileThroughShare(
      output
    );
  }
);

saveStrongSwanButton.addEventListener(
  "click",
  async function() {
    const output =
      createStrongSwanOutput();

    if (!output) {
      return;
    }

    await saveStrongSwanThroughShare(
      output
    );
  }
);
