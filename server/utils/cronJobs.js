const cron = require('node-cron');
const Donation = require('../models/Donation');
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const { calculateDistance } = require('./haversine');
const { calculateExpiryRisk } = require('./expiryRisk');
const { buildExpiryAlertEmail } = require('./expiryAlertEmail');

const CRITICAL_RADIUS_KM = 10;

const findNearbyNgos = async (donation) => {
  const ngos = await User.find({
    role: 'ngo',
    email: { $exists: true, $ne: '' },
    'location.lat': { $exists: true },
    'location.lng': { $exists: true }
  }).select('name email location organization');

  return ngos
    .map((ngo) => ({
      ngo,
      distanceKm: calculateDistance(
        donation.location.lat,
        donation.location.lng,
        ngo.location.lat,
        ngo.location.lng
      )
    }))
    .filter(({ distanceKm }) => distanceKm <= CRITICAL_RADIUS_KM);
};

const refreshDonationRisk = async (donation, now) => {
  const expiryRisk = calculateExpiryRisk({
    category: donation.category,
    storageType: donation.storageType,
    expiryTime: donation.expiryTime,
    createdAt: donation.createdAt,
    now
  });

  donation.riskScore = expiryRisk.riskScore;
  donation.riskLevel = expiryRisk.riskLevel;
  donation.safePickupWindow = expiryRisk.safePickupWindow;
};

const sendCriticalExpiryAlerts = async (donation, nearbyNgos, now) => {
  for (const { ngo, distanceKm } of nearbyNgos) {
    const email = buildExpiryAlertEmail({ ngo, donation, distanceKm });
    await sendEmail({
      to: ngo.email,
      subject: email.subject,
      text: email.text,
      html: email.html
    });
  }

  donation.criticalAlertSentAt = now;
  donation.criticalAlertedNgoIds = nearbyNgos.map(({ ngo }) => ngo._id);
};

const startCronJobs = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running cron job to check expiry risk and alerts...');
      const now = new Date();
      
      const result = await Donation.updateMany(
        { 
          status: 'pending', 
          expiryTime: { $lt: now } 
        },
        { 
          $set: { status: 'expired' } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Marked ${result.modifiedCount} donations as expired.`);
      }

      const oneHourFromNow = new Date(now.getTime() + 60 * 60000);
      const activeDonations = await Donation.find({
        status: 'pending',
        expiryTime: { $gt: now }
      }).populate('donor', 'name phone organization');

      for (const donation of activeDonations) {
        await refreshDonationRisk(donation, now);

        const isCritical = donation.expiryTime <= oneHourFromNow;
        if (isCritical && !donation.criticalAlertSentAt) {
          const nearbyNgos = await findNearbyNgos(donation);

          if (nearbyNgos.length > 0) {
            await sendCriticalExpiryAlerts(donation, nearbyNgos, now);
            console.log(
              `Sent critical expiry alerts for ${donation.foodName} to ${nearbyNgos.length} NGOs.`
            );
          } else {
            donation.criticalAlertSentAt = now;
            donation.criticalAlertedNgoIds = [];
            console.log(`No NGOs within ${CRITICAL_RADIUS_KM}km for ${donation.foodName}.`);
          }
        }

        await donation.save();
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

module.exports = startCronJobs;
