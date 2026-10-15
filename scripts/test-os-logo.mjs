import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
try {
  const { osLogo } = await server.ssrLoadModule('/src/lib/os-logo.ts')
  const cases = [
    ['Ubuntu 24.04.1 LTS', 'ubuntu'], ['Debian GNU/Linux 12 (bookworm)', 'debian'],
    ['AlmaLinux 9.4 (Seafoam Ocelot)', 'almalinux'], ['Rocky Linux 9.4', 'rockylinux'],
    ['CentOS Stream 9', 'centos'], ['Fedora Linux 41', 'fedora'],
    ['Red Hat Enterprise Linux 9.5', 'redhat'], ['RHEL 8', 'redhat'],
    ['openSUSE Tumbleweed', 'opensuse'], ['SUSE Linux Enterprise Server 15', 'opensuse'],
    ['Arch Linux', 'archlinux'], ['archlinux', 'archlinux'], ['NixOS 24.11', 'nixos'],
    ['Gentoo Linux', 'gentoo'], ['Linux Mint 22', 'linuxmint'],
    ['Microsoft Windows Server 2022 Standard', 'windows11'], ['Windows 11 Pro', 'windows11'],
    ['macOS 15.0', 'apple'], ['Darwin 24.0.0', 'apple'],
    ['Proxmox VE 8.3 (Debian GNU/Linux 12)', 'proxmox'],
    ['Alpine Linux v3.21', 'alpine'], ['GNU/Linux', 'linux'], ['OpenWrt 24.10', 'openwrt'], ['ImmortalWrt 23.05', 'openwrt'], ['Kali GNU/Linux Rolling', 'kali'], ['Manjaro Linux', 'manjaro'],
    ['FreeBSD 14.2', 'freebsd'], ['unknown', 'unknown'], ['', 'unknown'],
    [undefined, 'unknown'], [null, 'unknown'], ['ResearchOS', 'unknown'],
  ]
  for (const [name, expected] of cases) {
    const result = osLogo(name)
    assert.equal(result.id, expected, String(name))
    if (result.id !== 'unknown') assert.ok(['svg', 'webp'].some(ext => existsSync(`src/assets/os/${result.id}.${ext}`)), result.id)
  }
  console.log('OS logos passed: distributions, aliases, family fallback, missing names and asset coverage')
}
finally { await server.close() }
