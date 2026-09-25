// Competent-player bot for Gloves & Goggles.
// npm install playwright   (uses your installed Chrome)
// node bot.js [seed] [gameMinutes] [file]          full JSON report
// QUIET=1 node bot.js 3 15                          one-line summary
// NOHEAT=1  reckless player (ignores heat, sells to cops)   VW=380  phone width, reports overflow
// Freezes the real clock, steps sim() directly with a seeded RNG, and makes every
// decision through a real DOM click on a [data-act] button (so it goes through the
// game's own delegation and respects `disabled`). Max 2 clicks per 0.5 game-seconds.
const { chromium } = require('playwright');
const path = require('path'), url = require('url');
const SEED = parseInt(process.argv[2] || '1', 10);
const MINUTES = parseFloat(process.argv[3] || '15');
const FILE = url.pathToFileURL(path.resolve(process.argv[4] || path.join(__dirname, '..', 'index.html'))).href;
const QUIET = process.env.QUIET === '1';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: +(process.env.VW||1280), height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.addInitScript(seed => {
    try { localStorage.clear(); } catch (e) {}
    let a = seed >>> 0;
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    performance.now = () => 0;               // rAF loop keeps rendering, never advances the sim
    window.setTimeout = (f) => 0;            // toasts etc. fire nothing we depend on
  }, SEED);
  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(({ MINUTES, NOHEAT }) => {
    const T = { beats: {}, minutes: [], clicks: 0, arcs: {}, income: 0, incomeMin: 0, src: {}, warrants: 0, raids: 0, peakHeat: 0, overflow: [], tierT: [0,0,0,0], plantsSeen: 0, plantsSold: 0, floorHits: 0, stockLostToRaids: 0 };
    const beat = (k) => { if (T.beats[k] == null) T.beats[k] = +(S.t / 60).toFixed(2); };
    // function declarations are globals; reassigning them redirects the game's internal calls
    let CTX = 'other';
    const _sellOne = sellOne; sellOne = function () { const p = CTX; CTX = 'walkin'; try { return _sellOne.apply(this, arguments); } finally { CTX = p; } };
    const _closeSale = closeSale; closeSale = function () { const p = CTX; CTX = 'client'; try { return _closeSale.apply(this, arguments); } finally { CTX = p; } };
    const _takeLoot = takeLoot; takeLoot = function () { const p = CTX; CTX = 'loot'; try { return _takeLoot.apply(this, arguments); } finally { CTX = p; } };
    const _resolveScheme = resolveScheme; resolveScheme = function () { const p = CTX; CTX = 'backedCut'; try { return _resolveScheme.apply(this, arguments); } finally { CTX = p; } };
    const _bust = bustedByPlant; bustedByPlant = function () { T.plantsSold++; return _bust.apply(this, arguments); };
    const _oc = openClient; openClient = function (c, plant) { if (plant) T.plantsSeen++; return _oc.apply(this, arguments); };
    const _add = addCash;
    addCash = function (n, el) { if (n > 0) { T.income += n; T.incomeMin += n; T.src[CTX] = (T.src[CTX] || 0) + n; } return _add(n, el); };
    const _rankUp = rankUp;
    rankUp = function (c, r, sc) {
      const nm = c.named || ('gen:' + c.uid);
      (T.arcs[nm] = T.arcs[nm] || []).push([RANKS[r].n, +(S.t / 60).toFixed(2)]);
      return _rankUp(c, r, sc);
    };

    let clicksThisStep = 0;
    function click(sel) {
      if (clicksThisStep >= 2) return false;
      const el = document.querySelector(sel);
      if (!el || el.disabled) return false;
      el.click(); clicksThisStep++; T.clicks++; return true;
    }
    function tab(name) {
      if (S.tab === name) return true;
      const el = document.querySelector('#tabs button[data-tab="' + name + '"]');
      if (!el) return false; el.click(); render(); return true;   // tab switch is a free glance
    }

    const TARGET = { mask: 2, gloves: 1, rope: 2, smoke: 2, cape: 2, button: 1,
      goggles: 2, launcher: 1, boots: 1, drone: 1, ray: 1, field: 1, cannon: 1 };
    const RES = ['board', 'optics', 'laser', 'grapple', 'magnet', 'ray', 'drone', 'field', 'cannon'];
    const UPQ = ['shelf', 'bench', 'alley', 'ozzy', 'priya', 'exp2', 'fab', 'shelf', 'sheila', 'bench', 'tick', 'fab', 'shelf', 'exp3', 'fab', 'alley'];
    const BAYQ = ['fab', 'optics', 'disp', 'front', 'chem'];

    function bestLoadout(k) {
      const c = k.c, sc = k.scheme, bud = budgetOf(c);
      const sel = {};
      for (;;) {
        const base = loadout(c, sc, sel);
        let best = null, bestV = 0.004;
        for (const id in S.stock) {
          if ((sel[id] || 0) >= S.stock[id]) continue;
          const pay = clientPay(GOOD(id), sc);
          if (base.cost + pay > bud) continue;
          const s2 = Object.assign({}, sel); s2[id] = (s2[id] || 0) + 1;
          const L = loadout(c, sc, s2);
          const v = (L.chance - base.chance) + pay / 1e6;
          if (v > bestV) { bestV = v; best = id; }
        }
        if (!best) break;
        sel[best] = (sel[best] || 0) + 1;
      }
      return sel;
    }

    function handleCounter() {
      const k = S.counter; if (!k) return false;
      if (k.kind === 'client') {
        if (!NOHEAT && k.c.nem === 'crime, generally') return click('[data-act="away"]');   // the readable tell
        const want = bestLoadout(k);
        for (const id in want) if ((k.sel[id] || 0) < want[id]) return click('[data-act="more"][data-id="' + id + '"]') || true;
        for (const id in k.sel) if ((want[id] || 0) < k.sel[id]) return click('[data-act="less"][data-id="' + id + '"]') || true;
        const L = loadout(k.c, k.scheme, k.sel);
        if (!L.items.length) {
          // nothing useful: if we have nothing they can afford, let them go
          return click('[data-act="away"]');
        }
        const backEV = L.chance * k.scheme.pay * 0.25 - L.cost * 0.5;
        beat('firstClientSale');
        return click(backEV > 0 && S.cash > 200 ? '[data-act="back"]' : '[data-act="sell"]');
      }
      if (k.kind === 'return') {
        if (S.cash > k.price + 20) return click('[data-act="buyback"]');
        return click('[data-act="nobuyback"]');
      }
      if (k.kind === 'loot') {
        if (NOHEAT || S.heat + k.b.heat < 72 || k.b.bp) { beat('firstLootTaken'); if (k.b.big) beat('garyCrate'); return click('[data-act="takeloot"]'); }
        return click('[data-act="refuseloot"]');
      }
      if (k.kind === 'event') {
        if (k.id === 'gloves') return click('[data-act="ev"][data-c="wait"]');
        if (k.id === 'inspect') return click('[data-act="ev"][data-c="bribe"]') || click('[data-act="ev"][data-c="hide"]');
        if (k.id === 'detect') return (S.heat < 70 && click('[data-act="ev"][data-c="deny"]')) || click('[data-act="ev"][data-c="bribe"]') || click('[data-act="ev"][data-c="deny"]');
      }
      return false;
    }

    function handleHeat() {
      if (NOHEAT) return false;
      if (S.heat < 70 && !S.raid) return false;
      const nextBp = RES.find(id => !S.bp[id] && (!BP(id).req || S.bp[BP(id).req]));
      const spareSch = !nextBp || S.sch - 8 >= BP(nextBp).c;
      if (spareSch && click('[data-act="shred"]')) return true;
      if (S.cash > launderCost() * 3 && click('[data-act="launder"]')) return true;
      if (S.raid > 0 || S.heat > 85) return click('[data-act="stocktake"]') || click('[data-act="launder"]') || click('[data-act="shred"]');
      return false;
    }

    function handleShop() {
      tab('shop');
      if (S.bays.indexOf(null) >= 0) {
        for (const b of BAYQ) if (S.bays.indexOf(b) < 0 && click('[data-act="bay"][data-id="' + b + '"]')) { beat('bayChosen'); return true; }
      }
      for (const id of UPQ) {
        const u = UP(id); const lvl = S.ups[id] || 0;
        if (lvl >= u.max) continue;
        if (u.expand && u.expand !== S.stage + 1) continue;
        if (S.rep < (u.rep || 0)) return false;           // wait for the next thing in line
        const cost = upCost(u);
        if (S.cash - cost < (u.expand ? 0 : 40)) return false;
        if (click('[data-act="up"][data-id="' + id + '"]')) {
          beat('firstUpgrade'); if (u.staff) beat('firstStaff'); if (u.expand === 2) beat('expand2'); if (u.expand === 3) beat('expand3');
          return true;
        }
        return false;
      }
      return false;
    }

    function handleFiles() {
      const id = RES.find(id => !S.bp[id] && (!BP(id).req || S.bp[BP(id).req]));
      if (!id || S.sch < BP(id).c) return false;
      tab('files');
      if (click('[data-act="res"][data-id="' + id + '"]')) { beat('firstResearch'); return true; }
      return false;
    }

    function need(r) { const m = {}; for (const k in r) { const d = r[k] - (S.mat[k] || 0); if (d > 0) m[k] = d; } return m; }
    function handleBench() {
      tab('bench');
      if (S.junk > 0 && !S.staff.ozzy && click('[data-act="strip"]')) return true;
      for (const d of S.dmg) {
        const g = GOOD(d.gid); const cost = Math.max(2, Math.round(g.price * 0.18 * (1 - d.cond)));
        if (g.t >= 1 && S.cash > cost + 60 && shelfCount() < shelfCap()) { if (click('[data-act="refurb"][data-id="' + d.uid + '"]')) return true; }
        else if (click('[data-act="stripd"][data-id="' + d.uid + '"]')) return true;
      }
      if (S.bench.length >= benchSlots()) return false;
      const onBench = {}; for (const b of S.bench) onBench[b.id] = (onBench[b.id] || 0) + 1;
      const cands = GOODS.filter(g => !g.odd && (!g.bp || S.bp[g.bp]) && (S.stock[g.id] || 0) + (onBench[g.id] || 0) < TARGET[g.id]);
      cands.sort((a, b) => b.t - a.t || priceOf(b) - priceOf(a));
      for (const g of cands) {
        if (shelfCount() + S.bench.filter(b => !b.comp).length >= shelfCap()) break;
        if (canAfford(g.r)) { if (click('[data-act="build"][data-id="' + g.id + '"]')) return true; continue; }
        const m = need(g.r);
        // components first
        for (const k in m) {
          const comp = COMPS.find(c => c.id === k);
          if (comp) {
            if (onBench[k]) return false;
            if (canAfford(comp.r)) return click('[data-act="buildc"][data-id="' + k + '"]');
            const m2 = need(comp.r);
            for (const k2 in m2) { const cm = COMPS.find(c => c.id === k2);
              if (cm) { if (!onBench[k2] && canAfford(cm.r)) return click('[data-act="buildc"][data-id="' + k2 + '"]'); continue; }
              if (S.cash > matCost(k2) + 30) return click('[data-act="buymat"][data-id="' + k2 + '"]');
            }
          } else if (S.cash > matCost(k) + 30 && g.t >= 1) {
            return click('[data-act="buymat"][data-id="' + k + '"]');
          } else if (S.cash > matCost(k) + 15 && g.t === 0 && S.junk === 0) {
            return click('[data-act="buymat"][data-id="' + k + '"]');
          }
        }
      }
      return false;
    }

    const TOTAL = MINUTES * 600; let lastMin = 0;
    render();
    let prevRaid = 0;
    for (let tick = 0; tick < TOTAL; tick++) {
      const shelfBefore = shelfCount();
      sim(TICK);
      if (!prevRaid && S.raid > 0) T.warrants++;
      if (prevRaid > 0 && S.raid <= 0 && S.heat === 24) { T.raids++; T.stockLostToRaids += shelfBefore; }
      prevRaid = S.raid; T.peakHeat = Math.max(T.peakHeat, S.heat); T.tierT[heatTier()] += 0.1;
      for (const c of S.clients) if (c.budM < 0.75 && !c._fl) { c._fl = 1; T.floorHits++; }
      if (tick % 5 !== 0) continue;
      render(); clicksThisStep = 0;
      if (S.counter) beat('firstVisitor');
      if (S.reports > 0) beat('firstReport');
      if (Object.keys(S.syn).length) beat('firstSynergy');
      if (S.hzSeen) beat('prestigeVisible');
      if (S.evSeen.gloves) beat('setbackGloves');
      if (tick % 50 === 0) { const ow = document.documentElement.scrollWidth - window.innerWidth; if (ow > 0 && T.overflow.length < 12) { const wide=[...document.querySelectorAll('#app *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+1).slice(0,3).map(e=>e.tagName+'.'+e.className+'#'+e.id); T.overflow.push({ t: Math.round(S.t), ow, tab: S.tab, counter: S.counter && S.counter.kind, wide }); } }
      if (S.sold > 0) beat('firstSale');
      handleHeat() || handleCounter() || handleFiles() || handleShop() || handleBench();
      if (clicksThisStep < 2) handleBench();
      const m = Math.floor(S.t / 60);
      if (m > lastMin) {
        lastMin = m;
        const gary = S.clients.find(c => c.named === 'gary');
        T.minutes.push({ m, cash: Math.round(S.cash), incomeThisMin: Math.round(T.incomeMin), rep: Math.round(S.rep), heat: Math.round(S.heat),
          pat: Math.round(S.pat), bp: Object.keys(S.bp).length, syn: Object.keys(S.syn).length, stage: S.stage,
          reports: S.reports, gary: gary ? cliName(gary) + ' [' + RANKS[rankOf(gary)].n + ', rep ' + Math.round(gary.rep) + ']' : '-' });
        T.incomeMin = 0;
      }
    }
    const clients = S.clients.filter(c => !c.plant).map(c => ({ n: cliName(c), rank: RANKS[rankOf(c)].n, rep: Math.round(c.rep), runs: c.runs, wins: c.wins, named: !!c.named }))
      .sort((a, b) => b.rep - a.rep);
    return { T, final: { cash: Math.round(S.cash), income: Math.round(T.income), rep: Math.round(S.rep), pat: Math.round(S.pat), bp: Object.keys(S.bp), syn: Object.keys(S.syn),
      stage: S.stage, bays: S.bays, staff: S.staff, reports: S.reports, raided: T.raided, heat: Math.round(S.heat), sch: Math.round(S.sch), clients: clients.slice(0, 8), log: LOG.slice(0, 8).map(s => s.replace(/<[^>]+>/g, '')) } };
  }, { MINUTES, NOHEAT: process.env.NOHEAT === '1' });

  if (process.env.SHOT) { await page.evaluate(()=>{ document.getElementById('toast').innerHTML=''; S.tab='clients'; render(); }); await page.screenshot({ path: process.env.SHOT, fullPage: !!process.env.FULL }); }
  // save survives reload? (real reload, storage NOT cleared this time)
  await page.evaluate(() => save());
  const before = await page.evaluate(() => ({ t: Math.round(S.t), cash: Math.round(S.cash), bp: Object.keys(S.bp).length }));
  const ctxState = await page.evaluate(() => localStorage.getItem('glovesandgoggles.v1'));
  const p2 = await browser.newPage();
  await p2.addInitScript(s => { try { localStorage.setItem('glovesandgoggles.v1', s); } catch (e) {} }, ctxState);
  await p2.goto(FILE, { waitUntil: 'load' }); await p2.waitForTimeout(400);
  const after = await p2.evaluate(() => ({ t: Math.round(S.t), cash: Math.round(S.cash), bp: Object.keys(S.bp).length }));
  result.saveRoundTrip = { before, after };
  result.errors = [...new Set(errors)];
  await browser.close();
  if (QUIET) {
    const f = result.final, b = result.T.beats, g = result.T.arcs.gary || [];
    console.log(JSON.stringify({ seed: SEED, cash: f.cash, income: f.income, rep: f.rep, pat: f.pat, bp: f.bp.length, syn: f.syn.length, stage: f.stage, reports: f.reports,
      gary: g.map(x => x[0].split(' ')[0] + '@' + x[1]).join(' '), garyCrate: b.garyCrate, expand2: b.expand2, expand3: b.expand3, errors: result.errors.length,
      src: Object.fromEntries(Object.entries(result.T.src).map(([k, v]) => [k, Math.round(100 * v / result.T.income) + '%'])),
      warrants: result.T.warrants, raids: result.T.raids, raidLoss: result.T.stockLostToRaids, floorHits: result.T.floorHits, peakHeat: Math.round(result.T.peakHeat), tierMin: result.T.tierT.map(x=>+(x/60).toFixed(1)).join("/"), overflow: result.T.overflow, plants: result.T.plantsSold+"/"+result.T.plantsSeen, beats: b, save: result.saveRoundTrip.after.t === result.saveRoundTrip.before.t,
      incomeByMin: result.T.minutes.map(m => m.incomeThisMin).join(',') }));
  } else console.log(JSON.stringify(result, null, 1));
})().catch(e => { console.error('BOT FAIL', e); process.exit(1); });
