# TOLF Configurator

Browser-based network profile generator for Apple devices and strongSwan.

**Live site:** https://configurator.tolf.is

TOLF Configurator creates network configuration profiles directly in the browser.  
All configuration data is processed locally. Nothing is sent to a backend.

---

## Screenshot

![TOLF Configurator](docs/screenshot.jpg)

---

## Current features

### IKEv2

Create Apple `.mobileconfig` profiles for iPhone and iPad.

Supported settings include:

- Server
- Remote ID
- Local ID
- Username and password
- AES-128 / AES-256
- SHA-256 / SHA-384 / SHA-512
- Diffie-Hellman groups
- Dead Peer Detection
- Perfect Forward Secrecy
- MOBIKE
- Redirects
- IPv4/IPv6 Internal Subnet Attributes
- On Demand
- Wi-Fi rules
- Cellular rules
- Ethernet rules
- Additional SSID-based rules

Existing `.mobileconfig` profiles can also be imported and edited.

### strongSwan

Generate `.sswan` profiles for strongSwan VPN Client on Android from the same IKEv2 settings.

---

## Privacy

TOLF Configurator has no backend for profile generation.

The following data remains in your browser:

- VPN server address
- Remote ID
- Local ID
- Username
- Password
- Imported configuration profiles
- Generated configuration data

No analytics or tracking scripts are required for profile generation.

The project is public so the implementation can be inspected directly.

---

## How it works

TOLF Configurator runs entirely in the browser.

For Apple devices it generates an Apple configuration profile:

`.mobileconfig`

For strongSwan it generates:

`.sswan`

The generated files can then be installed, shared or saved depending on the device and browser.

---

## Apple IKEv2 profiles

Generated Apple profiles use the built-in IKEv2 implementation in iOS and iPadOS.

No third-party VPN application is required.

The resulting VPN configuration appears in the system VPN settings.

On Demand rules can control VPN behavior depending on:

- Wi-Fi
- Cellular
- Ethernet
- Specific Wi-Fi network names

---

## Import existing profiles

Existing Apple IKEv2 `.mobileconfig` profiles can be imported into the configurator.

The configurator reads the IKEv2 payload, displays supported settings and allows them to be edited before generating a new profile.

Where possible, profile identifiers and UUIDs are preserved.

---

## Planned

### DNS

Generate encrypted DNS configuration profiles.

Planned support includes:

- DNS over HTTPS
- DNS over TLS
- Server addresses
- Matching domains
- On Demand rules

### Wi-Fi

Generate Wi-Fi configuration profiles.

Planned support includes:

- SSID
- Security type
- Password
- Auto Join
- Enterprise Wi-Fi
- EAP settings
- Certificates

---

## Platform behavior

### iPhone / iPad

- Install Profile
- Share Profile
- Share strongSwan

### Windows

- Save Profile
- Save strongSwan

Direct Apple profile installation is disabled on Windows.

---

## Project status

Current public release:

**v0.2.0**

TOLF Configurator is under active development.

---

## Source

The project uses plain:

- HTML
- CSS
- JavaScript

No frontend framework is required.

The goal is to keep the implementation small, readable and easy to verify.

---

## Disclaimer

TOLF Configurator is an independent project and is not affiliated with, endorsed by, sponsored by, or supported by Apple Inc. or Google LLC.

Apple, iPhone, iPad and iOS are trademarks of Apple Inc.

Android and Google are trademarks of Google LLC.

---

## Website

https://configurator.tolf.is
