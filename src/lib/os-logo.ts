/** Specific distributions precede the generic Linux/Unix family names. */
const SYSTEMS = [
  { id: 'proxmox', label: 'Proxmox VE', match: /\b(?:proxmox|pve)\b/i },
  { id: 'almalinux', label: 'AlmaLinux', match: /\balma(?:linux)?\b/i },
  { id: 'rockylinux', label: 'Rocky Linux', match: /\brocky(?:linux)?\b/i },
  { id: 'linuxmint', label: 'Linux Mint', match: /\b(?:linux\s*mint|mint)\b/i },
  { id: 'alpine', label: 'Alpine Linux', match: /\balpine\b/i },
  { id: 'freebsd', label: 'FreeBSD', match: /\bfree\s*bsd\b/i },
  { id: 'openwrt', label: 'OpenWrt / ImmortalWrt', match: /\b(?:open\s*wrt|immortalwrt)\b/i },
  { id: 'kali', label: 'Kali Linux', match: /\bkali\b/i },
  { id: 'manjaro', label: 'Manjaro', match: /\bmanjaro\b/i },
  { id: 'ubuntu', label: 'Ubuntu', match: /\bubuntu\b/i },
  { id: 'debian', label: 'Debian', match: /\bdebian\b/i },
  { id: 'archlinux', label: 'Arch Linux', match: /\barch(?:\s*linux)?\b/i },
  { id: 'centos', label: 'CentOS', match: /\bcent\s*os\b/i },
  { id: 'fedora', label: 'Fedora', match: /\bfedora\b/i },
  { id: 'redhat', label: 'Red Hat Enterprise Linux', match: /\b(?:red\s*hat|rhel)\b/i },
  { id: 'opensuse', label: 'openSUSE / SUSE', match: /\b(?:open\s*suse|suse|sles)\b/i },
  { id: 'nixos', label: 'NixOS', match: /\bnix\s*os\b/i },
  { id: 'gentoo', label: 'Gentoo', match: /\bgentoo\b/i },
  { id: 'windows11', label: 'Windows', match: /\b(?:windows|win(?:dows)?\s*server|microsoft\s+windows)\b/i },
  { id: 'apple', label: 'macOS', match: /\b(?:mac\s*os(?:\s*x)?|os\s*x|darwin)\b/i },
  { id: 'linux', label: 'Linux', match: /\b(?:linux|oracle|amazon|amzn|raspbian|raspberry\s*pi\s*os|deepin|openeuler|euleros|opencloudos|anolis)\b/i },
] as const

export function osLogo(os: string | null | undefined): { id: string, label: string } {
  const name = os?.trim() ?? ''
  const system = SYSTEMS.find(system => system.match.test(name))
  return system ? { id: system.id, label: system.label } : { id: 'unknown', label: name || '未知系统' }
}
