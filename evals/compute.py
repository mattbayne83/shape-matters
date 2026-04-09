"""
Cycle 4 computations - pure Python, no dependencies beyond stdlib and math.
"""
import math

# ─── Core model functions ────────────────────────────────────────────────────

def employees_per_layer(levels, employees):
    if levels <= 1:
        return [employees]
    span = employees ** (1 / levels)
    raw = [employees / (span ** k) for k in range(levels)]
    raw_sum = sum(raw)
    return [v / raw_sum * employees for v in raw]

def torque_profile(levels, employees, fidelity_rate):
    r = fidelity_rate / 100
    layer_counts = employees_per_layer(levels, employees)
    profile = []
    for origin in range(levels):
        t = sum(layer_counts[k] * r ** abs(origin - k) for k in range(levels))
        profile.append(t / employees if employees > 0 else 1)
    return profile

def calc_thermal_lag(levels, decision_cycle):
    total_delay = decision_cycle * (levels - 1) ** 2
    marginal = decision_cycle * (2 * levels - 3) if levels > 1 else 0
    return total_delay, marginal

def lag_health(total_delay):
    return 100 * math.exp(-total_delay / 100)

# ─── Reference companies ─────────────────────────────────────────────────────

companies = {
    "Valve":  dict(L=1, E=350,       f=82, d=1.5, arch="flat"),
    "Haier":  dict(L=3, E=75000,     f=82, d=1.0, arch="experimental"),
    "Nucor":  dict(L=4, E=32700,     f=82, d=2.0, arch="flat"),
    "Meta":   dict(L=6, E=74067,     f=82, d=2.5, arch="flattened"),
    "Google": dict(L=8, E=183323,    f=82, d=3.5, arch="tech"),
    "Amazon": dict(L=9, E=1556000,   f=82, d=3.0, arch="tech"),
}

# ─── H1: Authority-weighted agility (decentralizationIndex) ──────────────────

print("\n" + "="*70)
print("H1: AUTHORITY-WEIGHTED AGILITY")
print("="*70)

def make_authority_profile(levels, decentralization_index):
    """
    decentralization_index: 0=CEO-only, 100=IC-empowered
    Returns normalized authority weights [layer 0=IC, ..., layer L-1=CEO]
    CEO-only: all weight on layer L-1
    IC-empowered: geometric decay from layer 0 (more frontline authority)
    Linear interpolation between the two extremes.
    """
    if levels <= 1:
        return [1.0]

    # CEO-only profile: all weight at CEO (top layer)
    ceo_only = [0.0] * levels
    ceo_only[-1] = 1.0

    # IC-empowered profile: geometric decay from frontline
    r_decay = 0.5  # authority decays by 50% per layer going up
    ic_raw = [r_decay ** k for k in range(levels)]
    ic_sum = sum(ic_raw)
    ic_heavy = [v / ic_sum for v in ic_raw]

    # Linear interpolation
    t = decentralization_index / 100
    mixed = [(1 - t) * ceo_only[k] + t * ic_heavy[k] for k in range(levels)]
    total = sum(mixed)
    return [v / total for v in mixed]

def authority_weighted_agility(levels, employees, fidelity_rate, decentralization_index):
    """Compute agility as authority-weighted sum of torque profile."""
    profile = torque_profile(levels, employees, fidelity_rate)
    authority = make_authority_profile(levels, decentralization_index)
    return sum(authority[k] * profile[k] for k in range(levels))

# Archetype-based decentralization indices (empirical estimates)
archetype_dci = {
    "Valve":  100,  # fully flat, everyone decides
    "Haier":  90,   # self-managing micro-enterprises
    "Nucor":  70,   # mini-mill autonomy
    "Meta":   10,   # Zuckerberg centralized
    "Google": 65,   # engineer-led, 20% time
    "Amazon": 80,   # two-pizza teams, bias for action
}

print(f"\n{'Company':<10} {'L':>3} {'Fidelity':>10} {'CEO-only%':>10} {'DCI':>5} {'Auth-wtd%':>10} {'Lift':>8}")
print("-" * 65)

results_h1 = {}
for name, c in companies.items():
    r = c['f'] / 100
    fid = r ** (c['L']-1) * 100
    tp = torque_profile(c['L'], c['E'], c['f'])
    ceo_agility = tp[-1] * 100
    dci = archetype_dci[name]
    auth_agility = authority_weighted_agility(c['L'], c['E'], c['f'], dci) * 100
    lift = auth_agility - ceo_agility
    results_h1[name] = dict(fid=fid, ceo_agility=ceo_agility, auth_agility=auth_agility, dci=dci)
    print(f"{name:<10} {c['L']:>3} {fid:>10.2f}% {ceo_agility:>10.2f}% {dci:>5} {auth_agility:>10.2f}% {lift:>+8.2f}")

fid_rank = sorted(results_h1.keys(), key=lambda n: -results_h1[n]['fid'])
ceo_rank = sorted(results_h1.keys(), key=lambda n: -results_h1[n]['ceo_agility'])
auth_rank = sorted(results_h1.keys(), key=lambda n: -results_h1[n]['auth_agility'])
print(f"\nFidelity rank:       {' > '.join(fid_rank)}")
print(f"CEO-only agility:    {' > '.join(ceo_rank)}")
print(f"Auth-weighted rank:  {' > '.join(auth_rank)}")

# Spearman correlation
def spearman(keys, attr1, attr2, data):
    vals1 = [data[k][attr1] for k in keys]
    vals2 = [data[k][attr2] for k in keys]
    n = len(keys)
    sorted1 = sorted(range(n), key=lambda i: vals1[i])
    sorted2 = sorted(range(n), key=lambda i: vals2[i])
    ranks1 = [0]*n; ranks2 = [0]*n
    for rank, idx in enumerate(sorted1): ranks1[idx] = rank
    for rank, idx in enumerate(sorted2): ranks2[idx] = rank
    d2 = sum((ranks1[i] - ranks2[i])**2 for i in range(n))
    return 1 - 6*d2 / (n*(n**2-1))

keys = list(results_h1.keys())
rho_fid_ceo = spearman(keys, 'fid', 'ceo_agility', results_h1)
rho_fid_auth = spearman(keys, 'fid', 'auth_agility', results_h1)
print(f"\nSpearman ρ (fidelity vs CEO-only agility):     {rho_fid_ceo:.3f}")
print(f"Spearman ρ (fidelity vs auth-weighted agility): {rho_fid_auth:.3f}")

# Count rank inversions
fid_pos  = {n: i for i, n in enumerate(fid_rank)}
auth_pos = {n: i for i, n in enumerate(auth_rank)}
inversions = sum(1 for i, a in enumerate(keys) for b in keys[i+1:]
                 if (fid_pos[a] < fid_pos[b]) != (auth_pos[a] < auth_pos[b]))
print(f"Pairwise rank inversions: {inversions}/15")

# Amazon DCI crossover sweep
print("\nAmazon DCI sweep (at what DCI does Amazon exceed Meta?):")
meta_auth = authority_weighted_agility(6, 74067, 82, archetype_dci["Meta"]) * 100
print(f"Meta fixed at DCI={archetype_dci['Meta']}: {meta_auth:.2f}%")
prev_above = False
for dci in range(0, 105, 5):
    amazon_auth = authority_weighted_agility(9, 1556000, 82, dci) * 100
    above = amazon_auth > meta_auth
    if above and not prev_above:
        print(f"  DCI={dci}: Amazon={amazon_auth:.2f}% ← CROSSOVER (Amazon > Meta)")
    elif dci in [0, 25, 50, 75, 100]:
        print(f"  DCI={dci}: Amazon={amazon_auth:.2f}% {'✓' if above else '✗'}")
    prev_above = above

# ─── H2: Coordination cost term ──────────────────────────────────────────────

print("\n" + "="*70)
print("H2: COORDINATION COST TERM FOR TORQUE MODEL")
print("="*70)

def torque_ceo_for_dist(layer_counts, fidelity_rate, alpha=0.0):
    """CEO torque with coordination cost: net_mass(k) = n_k / (1 + alpha*log2(n_k+1))"""
    r = fidelity_rate / 100
    levels = len(layer_counts)
    ceo = levels - 1

    ceo_reach = 0
    norm = 0
    for k in range(levels):
        n_k = layer_counts[k]
        cp = 1 + alpha * math.log2(max(n_k, 1) + 1)
        ceo_reach += (n_k / cp) * r ** abs(ceo - k)
        norm += n_k / cp
    return ceo_reach / norm if norm > 0 else 0

def uniform_dist(levels, employees):
    n = employees / levels
    return [n] * levels

def geometric_dist(levels, employees):
    return employees_per_layer(levels, employees)

L, E, f = 9, 1556000, 82
geo = geometric_dist(L, E)
uni = uniform_dist(L, E)

geo_baseline = torque_ceo_for_dist(geo, f, 0) * 100
uni_baseline = torque_ceo_for_dist(uni, f, 0) * 100
print(f"\nBaseline (alpha=0): Geometric CEO={geo_baseline:.2f}%, Uniform CEO={uni_baseline:.2f}%")
print(f"Inflation ratio: {uni_baseline/geo_baseline:.2f}x")
print(f"\nTarget: Uniform CEO drops to match geometric ({geo_baseline:.2f}%)")

print(f"\n{'alpha':>8} {'Geo CEO%':>10} {'Uni CEO%':>10} {'Ratio':>8} {'Gap closed%':>12}")
print("-" * 55)
for alpha in [0.0, 0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0]:
    g = torque_ceo_for_dist(geo, f, alpha) * 100
    u = torque_ceo_for_dist(uni, f, alpha) * 100
    ratio = u / g if g > 0 else 0
    gap_closed = (1 - (u - g) / (uni_baseline - geo_baseline)) * 100 if uni_baseline != geo_baseline else 100
    print(f"{alpha:>8.2f} {g:>10.2f}% {u:>10.2f}% {ratio:>8.3f}x {gap_closed:>11.1f}%")

# Does coordination cost restore half-life accuracy?
print("\nEffective layers (torque>50%) by alpha for uniform L=9 at f=82%:")
r = f / 100
for alpha in [0.0, 0.5, 1.0, 2.0, 5.0]:
    profile = []
    for origin in range(L):
        reach = 0
        norm = 0
        for k in range(L):
            n_k = uni[k]
            cp = 1 + alpha * math.log2(n_k + 1)
            reach += (n_k / cp) * r ** abs(origin - k)
            norm += n_k / cp
        profile.append(reach / norm if norm > 0 else 0)
    eff = sum(1 for p in profile if p > 0.5)
    print(f"  alpha={alpha:.1f}: CEO={profile[-1]*100:.1f}%, eff_layers={eff}, half-life pred=4")

# ─── H3: Unified ROI metric ──────────────────────────────────────────────────

print("\n" + "="*70)
print("H3: UNIFIED ORGANIZATIONAL IMPROVEMENT ROI")
print("="*70)

print(f"\n{'Company':<10} | {'Fid: rm1L':>10} {'Fid: +1pp':>10} {'pp≡1L':>8} | {'Hlth: rm1L':>11} {'Hlth: -10%d':>12} {'%-d≡1L':>9}")
print("-" * 78)

roi_table = {}
for name, c in companies.items():
    if c['L'] <= 1:
        continue
    r = c['f'] / 100
    fid = r ** (c['L']-1) * 100

    # Lever A: remove 1 level
    fid_A = r ** (c['L']-2) * 100
    delay_A, _ = calc_thermal_lag(c['L']-1, c['d'])
    health_A = lag_health(delay_A)

    delay_cur, _ = calc_thermal_lag(c['L'], c['d'])
    health_cur = lag_health(delay_cur)

    dfid_A = fid_A - fid
    dhealth_A = health_A - health_cur

    # Lever B: +1pp fidelity rate
    fid_B = ((c['f']+1)/100) ** (c['L']-1) * 100
    dfid_B = fid_B - fid

    # Lever C: -10% decision cycle
    delay_C, _ = calc_thermal_lag(c['L'], c['d'] * 0.9)
    health_C = lag_health(delay_C)
    dhealth_C = health_C - health_cur

    pp_equiv = dfid_A / dfid_B if dfid_B > 0 else float('inf')
    pct_equiv = dhealth_A / dhealth_C if dhealth_C > 0 else float('inf')

    roi_table[name] = dict(
        dfid_A=dfid_A, dfid_B=dfid_B, pp_equiv=pp_equiv,
        dhealth_A=dhealth_A, dhealth_C=dhealth_C, pct_equiv=pct_equiv,
        health_cur=health_cur, fid=fid
    )
    print(f"{name:<10} | {dfid_A:>10.2f}% {dfid_B:>10.2f}% {pp_equiv:>8.1f} | {dhealth_A:>11.2f} {dhealth_C:>12.2f} {pct_equiv:>9.1f}")

# Composite efficiency index
print("\nROI Efficiency Index: (Δhealth per unit effort) — comparing all levers:")
print("  Unit of effort: 1 level removed, OR 1pp fidelity improvement, OR 10% cycle reduction")
print()
print(f"  {'Company':<10} {'L':>4} {'d':>5} | {'Struct ROI':>12} {'Culture ROI':>12} {'Speed ROI':>12} | {'Best lever':>15}")
print("-" * 80)
for name, roi in roi_table.items():
    c = companies[name]
    struct_roi = roi['dhealth_A']  # health points per level removed
    culture_roi = 0  # no health gain from culture
    speed_roi = roi['dhealth_C']   # health points per 10% cycle reduction

    # Fidelity ROI (separate axis)
    struct_fid_roi = roi['dfid_A']
    culture_fid_roi = roi['dfid_B']

    best = "structure" if struct_roi > speed_roi else "speed"
    print(f"  {name:<10} {c['L']:>4} {c['d']:>5.1f} | {struct_roi:>12.2f} {culture_roi:>12.2f} {speed_roi:>12.2f} | {best:>15}")

print("\n  Observation: Culture ROI for health is always 0 (confirmed: lag unchanged by fidelity)")
print("  Speed ROI vs Struct ROI comparison:")
for name, roi in roi_table.items():
    c = companies[name]
    if roi['dhealth_C'] > 0:
        ratio = roi['dhealth_A'] / roi['dhealth_C']
        print(f"    {name}: struct/speed ratio = {ratio:.2f}x (removing 1 level = {ratio:.2f}x the health gain of -10% cycle)")

# ─── H4: Structural speed limit & two-pizza model ────────────────────────────

print("\n" + "="*70)
print("H4: STRUCTURAL SPEED LIMIT — TWO-PIZZA TEAM DECOMPOSITION")
print("="*70)

print("\nThe two-pizza team hypothesis: Amazon's L=9 nominal depth masks L=2-3 effective depth")
print("for most operational decisions.")
print()

# Compute lag health for team-internal decisions vs. escalated decisions
scenarios = [
    ("Team-internal (d=0.5d)", 2, 0.5),
    ("Team-internal (d=1.0d)", 2, 1.0),
    ("Cross-team (d=1.0d, L=3)", 3, 1.0),
    ("Cross-team (d=1.5d, L=3)", 3, 1.5),
    ("Director-level (d=2d, L=5)", 5, 2.0),
    ("VP-level (d=3d, L=7)", 7, 3.0),
    ("CEO-level full chain (d=3d, L=9)", 9, 3.0),
]

print(f"{'Scenario':<45} {'Delay':>8} {'Health':>8} {'Band':>10}")
print("-" * 75)
bands = [(85, "Live"), (65, "Fresh"), (40, "Aging"), (20, "Stale"), (0, "Expired")]
def health_band(h):
    for threshold, label in bands:
        if h >= threshold: return label
    return "Expired"

for scenario, L, d in scenarios:
    delay, _ = calc_thermal_lag(L, d)
    h = lag_health(delay)
    print(f"{scenario:<45} {delay:>8.1f}d {h:>8.1f} {health_band(h):>10}")

print()
print("Structural speed limit formula: L_max = floor(1 + sqrt(-100*ln(T/100)/d))")
print()
print(f"{'d (days)':>10} {'L_max(Live≥85)':>15} {'L_max(Fresh≥65)':>17} {'L_max(Aging≥40)':>17}")
print("-" * 65)
for d in [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0]:
    L_live  = math.floor(1 + math.sqrt(-100 * math.log(0.85) / d))
    L_fresh = math.floor(1 + math.sqrt(-100 * math.log(0.65) / d))
    L_aging = math.floor(1 + math.sqrt(-100 * math.log(0.40) / d))
    print(f"{d:>10.1f} {L_live:>15} {L_fresh:>17} {L_aging:>17}")

# ─── H5: HHI-based half-life generalization ──────────────────────────────────

print("\n" + "="*70)
print("H5: HERFINDAHL INDEX AND HALF-LIFE GENERALIZATION")
print("="*70)

def herfindahl_index(dist):
    total = sum(dist)
    return sum((v/total)**2 for v in dist) if total > 0 else 0

def count_effective_layers_for_dist(layer_counts, fidelity_rate):
    r = fidelity_rate / 100
    total = sum(layer_counts)
    levels = len(layer_counts)
    eff = 0
    for origin in range(levels):
        t = sum(layer_counts[k] * r ** abs(origin - k) for k in range(levels))
        if t / total >= 0.5:
            eff += 1
    return eff

r_82 = 0.82
h_base = math.log(2) / abs(math.log(r_82))
print(f"\nBase half-life h = log(2)/|log(0.82)| = {h_base:.4f} → floor(h)+1 = {math.floor(h_base)+1}")

L_test = 9
E_test = 1556000
f_test = 82

# 4 canonical distributions
dist_geo = geometric_dist(L_test, E_test)
dist_uni = uniform_dist(L_test, E_test)
# Top-heavy: more people at top (unusual; inverted pyramid)
dist_top = [E_test * (k+1)/sum(range(1, L_test+1)) for k in range(L_test)]
# Diamond: more people in middle
diamond_weights = [1,3,6,9,9,6,3,1,1]  # L=9
dw_sum = sum(diamond_weights)
dist_diamond = [E_test * w / dw_sum for w in diamond_weights]
# IC-heavy: more ICs (standard real-world bottom-heavy but even more extreme)
dist_ic_heavy = geometric_dist(L_test, E_test ** 1.5)  # use deeper geo to get more frontline

# Normalize IC-heavy to E_test
ich_sum = sum(dist_ic_heavy)
dist_ic_heavy = [v / ich_sum * E_test for v in dist_ic_heavy]

distributions_h5 = {
    "Geometric (standard)": dist_geo,
    "Uniform":              dist_uni,
    "Top-heavy":            dist_top,
    "Diamond (mid-heavy)":  dist_diamond,
    "IC-heavy (extr geo)":  dist_ic_heavy,
}

print(f"\n{'Distribution':<28} {'HHI':>8} {'CEO torque':>12} {'Eff layers':>12} {'h_pred':>8}")
print("-" * 74)

hhi_data = {}
for dist_name, dist in distributions_h5.items():
    hhi = herfindahl_index(dist)
    total = sum(dist)
    ceo_torque_raw = sum(dist[k] * r_82 ** abs((L_test-1) - k) for k in range(L_test))
    ceo_torque = ceo_torque_raw / total * 100
    eff = count_effective_layers_for_dist(dist, f_test)
    hhi_data[dist_name] = dict(hhi=hhi, ceo=ceo_torque, eff=eff)
    print(f"{dist_name:<28} {hhi:>8.4f} {ceo_torque:>11.2f}% {eff:>12} {h_base:>8.2f}")

# Derive correction formula
hhi_geo = hhi_data["Geometric (standard)"]['hhi']
eff_geo = hhi_data["Geometric (standard)"]['eff']

print(f"\nDerivation of correction: h_corr = h_base × (HHI_geo / HHI_actual)^β")
print(f"HHI_geo = {hhi_geo:.4f}, eff_geo = {eff_geo}")
print()

# Fit beta using uniform as reference
hhi_uni = hhi_data["Uniform"]['hhi']
eff_uni = hhi_data["Uniform"]['eff']
if hhi_uni != hhi_geo and eff_uni != eff_geo:
    beta = math.log(eff_uni / eff_geo) / math.log(hhi_geo / hhi_uni)
    print(f"Fitting β using uniform: log({eff_uni}/{eff_geo})/log({hhi_geo:.4f}/{hhi_uni:.4f}) = {beta:.4f}")
else:
    beta = 0
    print("Cannot fit β (uniform eff == geo eff)")

print(f"\nValidation:")
print(f"{'Distribution':<28} {'HHI':>8} {'h_corr':>10} {'pred_eff':>10} {'actual_eff':>12} {'err':>6}")
for dist_name, res in hhi_data.items():
    hhi = res['hhi']
    h_corr = h_base * (hhi_geo / hhi) ** beta if hhi > 0 else h_base
    eff_pred = min(L_test, math.floor(h_corr) + 1)
    err = eff_pred - res['eff']
    print(f"{dist_name:<28} {hhi:>8.4f} {h_corr:>10.2f} {eff_pred:>10} {res['eff']:>12} {err:>+6}")

# ─── Summary Table ───────────────────────────────────────────────────────────

print("\n" + "="*70)
print("SUMMARY: ALL REFERENCE COMPANY METRICS")
print("="*70)

print(f"\n{'Company':<10} {'L':>3} {'Fidelity':>10} {'Auth-Agility':>14} {'DCI':>5} | {'Delay':>8} {'Health':>8} {'Band':>8}")
print("-" * 72)
for name, c in companies.items():
    r = c['f'] / 100
    fid = r ** (c['L']-1) * 100
    dci = archetype_dci[name]
    auth_agil = authority_weighted_agility(c['L'], c['E'], c['f'], dci) * 100
    delay, _ = calc_thermal_lag(c['L'], c['d'])
    h = lag_health(delay)
    print(f"{name:<10} {c['L']:>3} {fid:>10.2f}% {auth_agil:>13.2f}% {dci:>5} | {delay:>8.1f}d {h:>8.1f} {health_band(h):>8}")
