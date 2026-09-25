"""Local fixture API for visual review only. Never included in the theme bundle.

python3 scripts/demo-server.py  ->  http://127.0.0.1:9911/api/*  (PORT=... to change)
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
import json, math, os, random, time

G = 1024 ** 3
NODES = [
    # name, country, group, online, expires_in
    ('Tokyo · 东京主节点', 'JP', '亚太', True, 120),
    ('Singapore · 新加坡', 'SG', '亚太', True, 5),
    ('Hong Kong · 香港边缘', 'HK', '亚太', True, None),
    ('Frankfurt · 法兰克福', 'DE', '欧洲', True, 42),
    ('Los Angeles · 洛杉矶', 'US', '', True, -3),
    ('备用节点 · 等待连接', 'CN', '', False, None),
]


def node(i, name, country, group, online, expires):
    now = int(time.time())
    t = time.time() / 4
    cpu = max(1.0, min(99.0, 12 + i * 15 + 10 * math.sin(t + i)))
    m = dict(uptime=86400 * (i + 3) + now % 86400, cpu=cpu, load=[.21 + i / 10, .38, .26],
             mem_total=8 * G, mem_used=(2 + i * 1.1) * G, swap_total=G, swap_used=0.1 * i * G,
             disk_total=80 * G, disk_used=(20 + i * 11) * G,
             net_rx=(i + 1) * 820000 * (1 + .5 * math.sin(t * 1.7 + i)) + random.random() * 90000,
             net_tx=(i + 1) * 310000 * (1 + .5 * math.cos(t + i)),
             total_rx=80 * G, total_tx=40 * G, month_rx=(20 + i * 30) * G, month_tx=(10 + i * 8) * G,
             tcp=36, udp=8, procs=128)
    return dict(id=i + 1, name=name, sort=i, group=group, public=True, online=online, country=country,
                last_seen=now if online else now - 7200, metrics=m if online else None,
                os='Ubuntu 24.04.1 LTS', kernel='6.8.0-45-generic', arch='x86_64', virt='kvm',
                cpu_name='AMD EPYC 7B13 64-Core Processor', cpu_cores=4, mem_total=8 * G, swap_total=G,
                disk_total=80 * G, agent_version='1.3.0', price=5 + i * 2.5, currency='USD',
                billing_cycle='monthly', expires_at=None, expires_in=expires,
                traffic_limit=(500 * G) if i % 2 == 0 else 0, traffic_mode='sum', traffic_reset_day=1,
                total_rx=80 * G, total_tx=40 * G, month_rx=(20 + i * 30) * G, month_tx=(10 + i * 8) * G,
                month_start='', day_rx=3 * G, day_tx=G,
                public_remark='演示数据 · 仅用于本地预览' if i == 0 else '')


def history(hours, points, series):
    now = int(time.time())
    n = min(points, hours * 60)
    step = hours * 3600 // n
    stamps = [now - (n - 1 - k) * step for k in range(n)]
    if series == 'ping':
        probes = {'1': '浙江电信', '2': '浙江联通', '3': '浙江移动'}
        ping = []
        for task, base in [(1, 165), (2, 157), (3, 132)]:
            for k, ts in enumerate(stamps):
                lost = random.random() < 0.02
                ping.append(dict(task_id=task, ts=ts, latency=None if lost else base + 8 * math.sin(k / 5 + task) + random.random() * 6,
                                 loss=100 if lost else 0))
        return dict(metrics=[], ping=ping, probes=probes, loss={'1': 0.4, '2': 0, '3': 2.1})
    metrics = [dict(ts=ts, cpu=30 + 15 * math.sin(k / 5) + random.random() * 8, mem_used=(3 + .4 * math.sin(k / 30)) * G,
                    disk_used=(20 + k / n) * G, net_rx=800000 + 300000 * math.sin(k / 4) + random.random() * 2e5,
                    net_tx=300000 + 100000 * math.cos(k / 6)) for k, ts in enumerate(stamps)]
    return dict(metrics=metrics, ping=[], probes={}, loss={})


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        q = parse_qs(url.query)
        if url.path == '/api/me':
            data = dict(authed=False, github=False, site_name='极简探针 · 演示', public_page=True)
        elif url.path == '/api/nodes':
            data = dict(nodes=[node(i, *n) for i, n in enumerate(NODES)])
        elif url.path.startswith('/api/nodes/') and url.path.endswith('/metrics'):
            data = history(int(q.get('hours', ['1'])[0]), int(q.get('points', ['360'])[0]), q.get('series', ['metrics'])[0])
        else:
            self.send_error(404)
            return
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('PORT', 9911))), Handler).serve_forever()
