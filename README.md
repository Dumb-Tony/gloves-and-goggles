# Gloves & Goggles — Villain Supply (thin prototype)

Single self-contained `index.html`. No network requests, no images, no fonts, no CDN, no build step.
Runs by double-clicking the file and from GitHub Pages. Works down to 380px.

## The hook this prototype exists to prove

**The circular customer economy.** You are the supplier, never the villain.

You sell gear to unsuccessful villains → their scheme resolves **off screen** → an **outcome report**
comes back → that report moves **their reputation, their budget and street demand** → and it sends you
**loot, damaged returns, or a stolen blueprint**. Every line in a client's file is a consequence of
something you sold them.

The payoff moment: the legendary client on your books is somebody you personally armed when he had
sixty dollars and a plan about a corner shop. His name changes as he rises — *Gary the Ungreat* →
*the Adequate* → *the Considerable* → *the Magnificent* → *the Gentleman* — and you can watch it happen
inside one sitting.

## How to play (5 lines)

1. **Strip junk crates** in the back alley for materials. They are free and the alley never quite runs out.
2. **Build** masks, gloves, rope and smoke bombs at the bench, then put them on the shelf.
3. When a villain arrives with a **brief**, sell them a **loadout** that covers every need on it — the odds
   bar is honest, and two right items together do something neither does alone.
4. Read the **report** when it comes back. Reputation, budgets and demand all move; crates and wreckage
   arrive at your counter.
5. Reinvest: shelves, a second bench, blueprints (`metal + wire → control board → laser module → ray pistol`),
   staff, and finally a bay you choose the function of.

## What the prototype proves

- **Customers are characters, not vending-machine transactions.** Eight named clients with a specialty,
  a personality line, a nemesis, a budget, a rank and a visible success history, plus generated
  archetypes. Rank-ups are announced, dossiers are readable, and a Nobody reliably becomes somebody
  within ~10 minutes of being supplied well.
- **Loadouts, not items.** Odds are computed from brief coverage, kit weight, the client's experience,
  and **five discoverable synergies** (Second-Storey Special, Now You Don't, Full Dark, the Overkill
  Package, the Gentleman's Kit). The first one you stumble into is a genuine "oh" — it is unnamed in the
  UI until you trigger it.
- **Feedback with consequences.** Success raises demand for the tags used, which raises shelf prices,
  which changes what is worth building. Failure returns damaged equipment you can buy back cheap,
  refurbish, or strip for schematics. Triumph sends loot and sometimes a blueprint you did not pay for.
- **Two-stage manufacturing chains that pay off.** Raw → component → product, with the laser module as
  the deliberate "this is where the margins live" beat.
- **Real physical growth.** An SVG floor plan that visibly grows: suspicious storefront → specialty store
  (one bay you assign) → warehouse (three bays and a hazard-striped loading dock), with staff and stock
  drawn inside it.
- **An economy that compounds without a dead end.** Scripted competent-player runs go from $40 to
  $8k–$26k inside 15 game-minutes while reputation, blueprints, synergies and client ranks all climb.
  Free junk crates are the floor: as long as the alley delivers, strip → build → sell always works, so
  broke-and-stalled is not reachable. The safety valve is *earned*, not a handout — the crates arrive
  slowly, and the fast money is in components and clients.

## How Heat creates decisions without arbitrary punishment

Heat is the price of having customers worth having. It rises with the value of what you sell, with loud
synergies, with accepting stolen crates, and with clients whose schemes go wrong and leave a paper trail.
It falls on its own, slowly.

Every effect is a **choice**, not a tax:

- **Quiet / Noticed / Watched / Exposed** tiers change the *shape* of business, not just a multiplier.
  Higher heat brings better-funded clients in more often (attention cuts both ways) but makes the walk-in
  trade nervous, and raises the share of customers who are undercover officers.
- **Undercover officers** are a skill check with readable tells (too-clean shoes, asking for a receipt,
  a nemesis listed as "crime, generally"). Turning them away costs nothing at all. Selling to one is a
  hard heat spike, never a loss of progress. Hiring Sheila flags them outright.
- **Three ways to pay heat down**, each in a different currency: *launder* (cash), *shred the paperwork*
  (schematics), *close for stocktake* (time and income). You always have one of them.
- **Accepting a loot crate** is explicitly priced: free money and materials, stated heat cost, and
  refusing it costs nothing but the money.
- **The inspector and the detective** are recoverable, funny, minutes-long incidents with three distinct
  options each — bribe, hide the good stock, or stonewall / give up the client / deny everything. Denying
  everything earns loyalty and a thank-you crate later.
- **The only hard consequence is telegraphed, avoidable and small.** At 100 heat a warrant is signed and
  you get a 45-second on-screen countdown; dropping below 90 by any of the three methods cancels it
  entirely. If you ignore it, they take **the shelf and only the shelf** — you keep cash, materials,
  blueprints, synergies, staff and every client — and heat resets to 24. Minutes to restock, never hours.
  There is no random wipe and no unavoidable collapse.

## How this stays distinct from Evil Lair LLC (parked)

Evil Lair LLC builds the clients' facilities; the risk flagged in the brief was that the player's own HQ
becomes less impressive than their customers'. Gloves & Goggles never touches a client's base. You never
see a lair, never take a construction contract, never place a room for somebody else. You sell **goods
over a counter**, and the only premises that grows is yours: shop → store → warehouse. The clients'
schemes are deliberately invisible — they happen off screen and arrive as text — because the subject of
this game is the shop, the shelf, the bench, and the file you are keeping on people.

## Prestige, on the horizon only

**The Rebrand**, at **340 Patents & Connections** (a competent 15-minute run reaches ~120–185, so the
button stays disabled and honest). Named, costed, with real copy: you liquidate on the Friday and reopen
as *Aperture & Sons, Theatrical Supplies* on the Monday. You lose premises, shelf, staff, materials and
cash; you keep patents, blueprints, synergies and your contact book — so the next shop opens already able
to build what this one needed hours to reach, and the clients you made famous still know where to find you.

## What it deliberately omits

- **No prestige run.** The button exists, is costed, and explains itself; taking it shows a prototype
  boundary toast. Post-rebrand content, doomsday components and the later product tiers are not built.
- **No individual worker sim.** Generic staff (fabricators) plus five named hires with distinct functions.
  No needs, schedules, morale or per-worker upgrades.
- **No market simulator.** Demand is a nine-tag multiplier moved by outcomes you caused and decaying back
  to normal. No competitors, no price elasticity model, no supply curve.
- **No combat, no scheme minigame.** Schemes resolve off screen on purpose — watching the job would make
  this a heist game instead of a shop game.
- **No custom architecture.** Predefined stages and bays; the player chooses each bay's function from five
  options. No freeform building.
- **Content is illustrative, not balanced content.** 14 goods, 3 components, 9 blueprints, 5 synergies,
  9 schemes, 8 named clients, 9 archetypes, 3 incidents. Enough to prove the loop, not a catalogue.
- **One-line haggling is absent.** Clients pay a computed price with a tag-fit markup; there is no
  negotiation minigame (that belongs to the Pawn Shop prototype).
- **Offline progress is intentionally poor.** Capped at two hours, half rate, walk-in trade only —
  nobody schemes while you are asleep.

## Verification performed (2026-09-24)

- Shared harness (`playtest.js villain-supply 40 8`, Windows paths, Chrome) → `errors: []`,
  `externalRequests: []`, ~325 game-seconds of state advancing. Note: the harness clears localStorage in
  an init script that also runs on its reload, so its `afterReload` cannot prove persistence — the bot
  below checks the save round trip separately (identical state after reopen, every seed).
- **Competent-player bot** (`playtest/bot.js`): seeded, steps the sim directly, acts only through real
  clicks on `[data-act]` buttons, at most 2 clicks per half game-second. 8 seeds × 15 game-minutes:
  - Economy compounds: gross income $22.6k–$35.5k; income per minute rises from ~$150–350 in minute 1 to
    ~$1.4k–7.3k in minute 14. Stage 3 reached in 7/8 runs, 5–8 blueprints, 3–4 synergies, 42–51 reports,
    Patents 148–205 of 340.
  - **Gary's arc completes in every run**: first rank-up at 1–4 min, his breakthrough crate and stolen
    blueprint at 3.3–8.9 min, Notorious (*the Magnificent*) in 7/8 runs and Legendary (*the Gentleman*)
    in 5/8. Three or more other named clients reach Notorious/Legendary per run.
  - Revenue split: clients 39–53%, walk-ins 26–38%, loot and backed cuts the rest.
  - Heat, competent play: peak 52–69, no warrants; 0–6 undercover officers per run, all turned away.
  - Heat, reckless play (`NOHEAT=1`: ignores heat, sells to officers, takes every crate): 0–2 warrants and
    0–1 raids per run, 32–42 shelf items lost per raid, income down 15–35% — and no dead end.
  - 380px viewport (`VW=380`): no horizontal overflow sampled every 5 game-seconds across 3 runs.
