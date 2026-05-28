const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { calculateDistance } = require('../utils/haversine');
const sendEmail = require('../utils/sendEmail');
const { getDonationInsights } = require('../utils/donationInsights');
const { calculateExpiryRisk } = require('../utils/expiryRisk');

// @route GET /api/donations
// @desc Get all donations (optionally filter by location and status)
// @access Private (NGOs and Admins)
router.get('/', protect, async (req, res) => {
  try {
    const { lat, lng, radius = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone organization')
      .sort({ createdAt: -1 });

    // If coordinates are provided, filter by distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      const nearbyDonations = donations.filter(donation => {
        const d = calculateDistance(
          userLat, 
          userLng, 
          donation.location.lat, 
          donation.location.lng
        );
        donation._doc.distance = d;
        donation._doc.insights = getDonationInsights(donation, d);
        return d <= radius;
      }).sort((a, b) => b._doc.insights.urgencyScore - a._doc.insights.urgencyScore);
      
      return res.json(nearbyDonations);
    }

    donations.forEach((donation) => {
      donation._doc.insights = getDonationInsights(donation);
    });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/donations/my-donations
// @desc Get logged in donor's donations
// @access Private (Donor only)
router.get('/my-donations', protect, authorize('donor'), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('acceptedBy', 'name organization')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route POST /api/donations
// @desc Create a donation
// @access Private (Donor only)
router.post('/', protect, authorize('donor'), upload.single('image'), async (req, res) => {
  try {
    const {
      foodName,
      category,
      quantity,
      unit,
      description,
      expiryTime,
      locationStr,
      foodType,
      storageType,
      pickupInstructions,
      freshPrepared,
      coveredProperly,
      noSpoilage
    } = req.body;
    const location = JSON.parse(locationStr);
    const safetyChecks = {
      freshPrepared: freshPrepared === 'true',
      coveredProperly: coveredProperly === 'true',
      noSpoilage: noSpoilage === 'true'
    };

    if (!safetyChecks.freshPrepared || !safetyChecks.coveredProperly || !safetyChecks.noSpoilage) {
      return res.status(400).json({ message: 'Please confirm all food safety checks before posting' });
    }

    if (new Date(expiryTime) <= new Date()) {
      return res.status(400).json({ message: 'Expiry time must be in the future' });
    }

    const expiryRisk = calculateExpiryRisk({ category, storageType, expiryTime });
    const insights = getDonationInsights({ quantity, unit, category, storageType, expiryTime });

    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const donation = await Donation.create({
      donor: req.user._id,
      foodName,
      category,
      quantity,
      unit,
      description,
      foodType,
      storageType,
      pickupInstructions,
      safetyChecks,
      estimatedMeals: insights.mealsEstimate,
      co2SavedKg: insights.co2SavedKg,
      riskScore: expiryRisk.riskScore,
      riskLevel: expiryRisk.riskLevel,
      safePickupWindow: expiryRisk.safePickupWindow,
      imageUrl,
      expiryTime,
      location
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/donations/critical-alerts
// @desc Get critical expiry alerts near the logged-in NGO
// @access Private (NGO only)
router.get('/critical-alerts', protect, authorize('ngo'), async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const userLat = Number(lat || req.user.location?.lat);
    const userLng = Number(lng || req.user.location?.lng);

    if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
      return res.status(400).json({ message: 'Valid NGO coordinates are required' });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60000);

    const donations = await Donation.find({
      status: 'pending',
      expiryTime: { $gt: now, $lte: oneHourFromNow }
    })
      .populate('donor', 'name phone organization')
      .sort({ expiryTime: 1 });

    const nearbyCriticalDonations = donations
      .map((donation) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          donation.location.lat,
          donation.location.lng
        );
        donation._doc.distance = distance;
        donation._doc.insights = getDonationInsights(donation, distance);
        donation._doc.notificationCreatedAt = donation.criticalAlertSentAt || donation.updatedAt;
        return donation;
      })
      .filter((donation) => donation._doc.distance <= Number(radius))
      .sort((a, b) => new Date(a.expiryTime) - new Date(b.expiryTime));

    res.json(nearbyCriticalDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/donations/:id/impact
// @desc Get collected donation impact details for donor share card
// @access Private (Donor, collecting NGO, or Admin)
router.get('/:id/impact', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('acceptedBy', 'name organization');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const isDonor = donation.donor?._id.toString() === req.user._id.toString();
    const isCollector = donation.acceptedBy?._id.toString() === req.user._id.toString();

    if (!isDonor && !isCollector && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['collected', 'delivered'].includes(donation.status)) {
      return res.status(400).json({ message: 'Impact card is available after collection' });
    }

    const mealsServed = Math.max(1, Math.round(
      donation.unit === 'servings'
        ? Number(donation.quantity || 0)
        : Number(donation.estimatedMeals || donation.quantity || 0)
    ));
    const co2SavedKg = Math.round(mealsServed * 1.25 * 10) / 10;
    const collectedDate = donation.collectedAt || donation.updatedAt;

    res.json({
      _id: donation._id,
      donorName: donation.donor?.name || 'FoodBridge donor',
      foodName: donation.foodName,
      mealsServed,
      co2SavedKg,
      ngoName: donation.acceptedBy?.organization || donation.acceptedBy?.name || 'Partner NGO',
      collectedDate,
      status: donation.status,
      shareText: `I just saved ${mealsServed} meals from going to waste through FoodBridge! \u{1F331}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/donations/:id/accept
// @desc NGO accepts a donation
// @access Private (NGO only)
router.put('/:id/accept', protect, authorize('ngo'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor', 'email name');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation is no longer available' });
    }

    donation.status = 'accepted';
    donation.acceptedBy = req.user._id;
    await donation.save();

    // Send email to donor
    if (donation.donor.email) {
      await sendEmail({
        to: donation.donor.email,
        subject: 'Your Food Donation was Accepted!',
        text: `Hello ${donation.donor.name},\n\nYour donation "${donation.foodName}" has been accepted by ${req.user.name}. They will pick it up soon.\n\nThank you for reducing food waste!\n\n- FoodBridge Team`
      });
    }

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/donations/:id/deliver
// @desc NGO marks a donation as collected
// @access Private (NGO only)
router.put('/:id/deliver', protect, authorize('ngo'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Must be accepted by the same NGO
    if (donation.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    donation.status = 'collected';
    donation.collectedAt = new Date();
    await donation.save();

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route DELETE /api/donations/:id
// @desc Delete a donation
// @access Private (Donor or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check authorization: either Admin or the Donor who created it
    if (req.user.role !== 'admin' && donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only pending can be deleted by donor (Admin can delete any)
    if (req.user.role !== 'admin' && donation.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete accepted or completed donations' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
