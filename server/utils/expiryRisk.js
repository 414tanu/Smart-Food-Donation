const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const categoryRisk = {
  cooked: 35,
  raw: 22,
  packaged: 10
};

const storageRisk = {
  hot: 12,
  'room-temperature': 30,
  refrigerated: -8,
  frozen: -22,
  'sealed-packaged': -14
};

const safeWindowMinutes = {
  cooked: {
    hot: 180,
    'room-temperature': 120,
    refrigerated: 360,
    frozen: 720,
    'sealed-packaged': 180
  },
  raw: {
    hot: 120,
    'room-temperature': 180,
    refrigerated: 480,
    frozen: 1440,
    'sealed-packaged': 360
  },
  packaged: {
    hot: 240,
    'room-temperature': 720,
    refrigerated: 1440,
    frozen: 2880,
    'sealed-packaged': 1440
  }
};

const getTimeRisk = (minutesToExpiry) => {
  if (minutesToExpiry <= 60) return 35;
  if (minutesToExpiry <= 180) return 25;
  if (minutesToExpiry <= 360) return 15;
  if (minutesToExpiry <= 720) return 8;
  return 0;
};

const getRiskLevel = (riskScore, minutesToExpiry) => {
  if (minutesToExpiry <= 60 || riskScore >= 75) return 'critical';
  if (riskScore >= 55) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
};

const calculateExpiryRisk = ({
  category,
  storageType,
  expiryTime,
  createdAt = new Date(),
  now = new Date()
}) => {
  const expiry = new Date(expiryTime);
  const created = new Date(createdAt || now);
  const minutesToExpiry = Math.max(0, Math.round((expiry - now) / 60000));
  const minutesSincePost = Math.max(0, Math.round((now - created) / 60000));
  const categoryKey = category || 'cooked';
  const storageKey = storageType || 'room-temperature';
  const recommendedWindow =
    safeWindowMinutes[categoryKey]?.[storageKey] ||
    safeWindowMinutes[categoryKey]?.['room-temperature'] ||
    120;

  const safeDeadlineByStorage = new Date(created.getTime() + recommendedWindow * 60000);
  const safePickupDeadline = new Date(Math.min(expiry.getTime(), safeDeadlineByStorage.getTime()));
  const safePickupMinutesRemaining = Math.max(0, Math.round((safePickupDeadline - now) / 60000));
  const storageWindowUsed = clamp(minutesSincePost / recommendedWindow, 0, 1);

  const riskScore = clamp(
    Math.round(
      (categoryRisk[categoryKey] || 25) +
      (storageRisk[storageKey] || 0) +
      getTimeRisk(minutesToExpiry) +
      storageWindowUsed * 25
    ),
    0,
    100
  );

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore, minutesToExpiry),
    minutesToExpiry,
    safePickupWindow: {
      start: now,
      end: safePickupDeadline,
      minutesRemaining: safePickupMinutesRemaining,
      recommendedWindowMinutes: recommendedWindow
    }
  };
};

module.exports = {
  calculateExpiryRisk
};
