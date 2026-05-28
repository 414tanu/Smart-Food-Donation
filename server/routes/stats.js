const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const getImpactStats = async () => {
  const activeNGOs = await User.countDocuments({ role: 'ngo' });
  const completedDonations = await Donation.find({ status: { $in: ['collected', 'delivered'] } });

  let foodSavedKg = 0;
  let mealsSaved = 0;

  completedDonations.forEach((donation) => {
    if (donation.unit === 'kg') {
      foodSavedKg += donation.quantity;
      mealsSaved += donation.estimatedMeals || donation.quantity * 2;
    } else if (donation.unit === 'servings') {
      mealsSaved += donation.quantity;
      foodSavedKg += donation.quantity * 0.5;
    }
  });

  return {
    activeNGOs,
    foodSavedKg: Math.round(foodSavedKg),
    mealsSaved: Math.round(mealsSaved),
    co2SavedKg: Math.round(mealsSaved * 1.25),
    wastePrevented: Math.round(foodSavedKg)
  };
};

// @route GET /api/stats/public
// @desc Get public impact statistics
router.get('/public', async (req, res) => {
  try {
    res.json(await getImpactStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/stats
// @desc Get system statistics
// @access Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const totalUsers = await User.countDocuments();
    const impactStats = await getImpactStats();

    res.json({
      totalDonations,
      totalUsers,
      ...impactStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
