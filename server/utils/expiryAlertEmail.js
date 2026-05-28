const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
};

const buildExpiryAlertEmail = ({ ngo, donation, distanceKm }) => {
  const pickupBy = donation.safePickupWindow?.end || donation.expiryTime;
  const riskScore = donation.riskScore ?? donation.insights?.riskScore ?? 'High';
  const donorName = donation.donor?.name || 'A FoodBridge donor';
  const donorPhone = donation.donor?.phone ? `+91 ${donation.donor.phone}` : 'Available after accepting';

  const subject = `Critical pickup nearby: ${donation.foodName} expires soon`;
  const text = [
    `Hello ${ngo.name},`,
    '',
    `A nearby donation is 1 hour or less from expiry and needs urgent pickup.`,
    '',
    `Food: ${donation.foodName}`,
    `Quantity: ${donation.quantity} ${donation.unit}`,
    `Category: ${donation.category}`,
    `Storage: ${donation.storageType}`,
    `Risk score: ${riskScore}/100`,
    `Pickup by: ${formatDateTime(pickupBy)}`,
    `Expiry: ${formatDateTime(donation.expiryTime)}`,
    `Distance: ${distanceKm.toFixed(1)} km`,
    `Donor: ${donorName}`,
    `Phone: ${donorPhone}`,
    `Address: ${donation.location.address}`,
    '',
    'Open FoodBridge and accept this pickup if your team can reach it in time.',
    '',
    '- FoodBridge Alerts'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:640px">
      <div style="background:#dc2626;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">Critical FoodBridge Pickup</h2>
        <p style="margin:6px 0 0">A nearby donation expires within 1 hour.</p>
      </div>
      <div style="border:1px solid #fecaca;border-top:0;padding:20px;border-radius:0 0 8px 8px">
        <h3 style="margin:0 0 12px;font-size:22px">${donation.foodName}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280">Quantity</td><td style="padding:6px 0;font-weight:700">${donation.quantity} ${donation.unit}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Category</td><td style="padding:6px 0">${donation.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Storage</td><td style="padding:6px 0">${donation.storageType}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Risk score</td><td style="padding:6px 0;font-weight:700;color:#dc2626">${riskScore}/100</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Safe pickup by</td><td style="padding:6px 0;font-weight:700">${formatDateTime(pickupBy)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Expiry</td><td style="padding:6px 0">${formatDateTime(donation.expiryTime)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Distance</td><td style="padding:6px 0">${distanceKm.toFixed(1)} km</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Donor</td><td style="padding:6px 0">${donorName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0">${donorPhone}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Address</td><td style="padding:6px 0">${donation.location.address}</td></tr>
        </table>
        <p style="margin-top:18px;color:#374151">Open FoodBridge and accept this pickup if your team can reach it in time.</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

module.exports = {
  buildExpiryAlertEmail
};
