const { calculateExpiryRisk } = require('./expiryRisk');

const getMealsEstimate = (quantity, unit) => {
  const numericQuantity = Number(quantity) || 0;

  if (unit === 'kg') {
    return Math.max(1, Math.round(numericQuantity * 2));
  }

  return Math.max(1, Math.round(numericQuantity));
};

const getFoodSavedKg = (quantity, unit) => {
  const numericQuantity = Number(quantity) || 0;

  if (unit === 'kg') {
    return numericQuantity;
  }

  return numericQuantity * 0.35;
};

const getDonationInsights = (donation, distance = 0) => {
  const now = new Date();
  const expiry = new Date(donation.expiryTime);
  const minutesLeft = Math.max(0, Math.round((expiry - now) / 60000));
  const mealsEstimate = getMealsEstimate(donation.quantity, donation.unit);
  const foodSavedKg = getFoodSavedKg(donation.quantity, donation.unit);
  const co2SavedKg = Math.round(foodSavedKg * 2.5 * 10) / 10;
  const expiryRisk = calculateExpiryRisk({
    category: donation.category,
    storageType: donation.storageType,
    expiryTime: donation.expiryTime,
    createdAt: donation.createdAt,
    now
  });

  let urgencyLevel = 'normal';
  if (minutesLeft <= 60) {
    urgencyLevel = 'critical';
  } else if (minutesLeft <= 180) {
    urgencyLevel = 'urgent';
  }

  const urgencyScore = Math.round(
    Math.max(0, 100 - minutesLeft / 6) +
    Math.max(0, 25 - Number(distance || 0)) +
    Math.min(25, mealsEstimate / 4)
  );

  return {
    mealsEstimate,
    foodSavedKg: Math.round(foodSavedKg * 10) / 10,
    co2SavedKg,
    riskScore: expiryRisk.riskScore,
    riskLevel: expiryRisk.riskLevel,
    safePickupWindow: expiryRisk.safePickupWindow,
    minutesLeft,
    urgencyLevel,
    urgencyScore
  };
};

module.exports = {
  getDonationInsights,
  getMealsEstimate,
  getFoodSavedKg
};
