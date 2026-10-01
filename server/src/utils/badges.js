const RULES = [
  { key: 'ten_hours', label: 'Getting Started', test: (h) => h >= 10 },
  { key: 'fifty_hours', label: '50 Hours Club', test: (h) => h >= 50 },
  { key: 'nss_120', label: 'NSS 120 Hours Complete', test: (h) => h >= 120 },
];

export async function awardBadges(user) {
  const have = new Set(user.badges.map((b) => b.key));
  let changed = false;
  for (const r of RULES) {
    if (!have.has(r.key) && r.test(user.hoursTotal)) {
      user.badges.push({ key: r.key, label: r.label });
      changed = true;
    }
  }
  if (changed) await user.save();
  return user;
}
