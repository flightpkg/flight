#define MyAppName "Flight"
#define MyAppVersion "v0.0.5"
#define MyAppPublisher "flightpkg"
#define MyAppURL "https://flightpkg.js.org"
#define MyAppExeName "flight.exe"
#define MyAppAssocName MyAppName + " File"
#define MyAppAssocExt ".myp"
#define MyAppAssocKey StringChange(MyAppAssocName, " ", "") + MyAppAssocExt
#define SrcDir "" ; Set this as the directory for the source code of flight

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{D38010F0-990A-4B7D-A4D9-61DBDD6B4FDF}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\flight
ChangesAssociations=yes
DisableProgramGroupPage=yes
LicenseFile=C:\Users\Adity\Downloads\v0.0.5\flight-0.0.5\LICENSE.txt
; InfoBeforeFile=C:\Users\Adity\Downloads\v0.0.5\flight-0.0.5\pre.rtf
; InfoAfterFile=C:\Users\Adity\Downloads\v0.0.5\flight-0.0.5\end.rtf
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputBaseFilename=mysetup
SetupIconFile=C:\Users\Adity\Downloads\Installer-logo.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{SrcDir}\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\.gitignore"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\.gitpod.yml"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\cargo.toml"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\cli.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\flight.lock"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\flight.rb"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\index.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\install.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\install.sh"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\LICENSE.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\pubKey.pgp"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\sonar-project.properties"; DestDir: "{app}"; Flags: ignoreversion
Source: "{SrcDir}\yarn.lock"; DestDir: "{app}"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Registry]
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocExt}\OpenWithProgids"; ValueType: string; ValueName: "{#MyAppAssocKey}"; ValueData: ""; Flags: uninsdeletevalue
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}"; ValueType: string; ValueName: ""; ValueData: "{#MyAppAssocName}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".myp"; ValueData: ""


[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "cmd.exe"; Parameters: "/c setx path `%PATH%;{app}`"
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

