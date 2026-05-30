const verifiedOrganizations = [
  {
    id: 'feeding-india-delhi',
    name: 'Feeding India',
    location: {
      lat: 28.4595,
      lng: 77.0266,
      address: 'Gurugram, Haryana, India'
    }
  },
  {
    id: 'goonj-delhi',
    name: 'Goonj',
    location: {
      lat: 28.5355,
      lng: 77.3910,
      address: 'Noida, Uttar Pradesh, India'
    }
  },
  {
    id: 'akshaya-patra-bengaluru',
    name: 'The Akshaya Patra Foundation',
    location: {
      lat: 13.0108,
      lng: 77.5511,
      address: 'Bengaluru, Karnataka, India'
    }
  },
  {
    id: 'robin-hood-army-delhi',
    name: 'Robin Hood Army',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'New Delhi, India'
    }
  },
  {
    id: 'uday-foundation-delhi',
    name: 'Uday Foundation',
    location: {
      lat: 28.5672,
      lng: 77.2100,
      address: 'New Delhi, India'
    }
  },
  {
    id: 'no-food-waste-chennai',
    name: 'No Food Waste',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Chennai, Tamil Nadu, India'
    }
  },
  {
    id: 'roti-bank-mumbai',
    name: 'Mumbai Roti Bank',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Mumbai, Maharashtra, India'
    }
  },
  {
    id: 'smile-foundation-delhi',
    name: 'Smile Foundation',
    location: {
      lat: 28.5355,
      lng: 77.2588,
      address: 'South Delhi, Delhi, India'
    }
  },
  {
    id: 'annamrita-iskcon',
    name: 'Annamrita (ISKCON Food Relief)',
    location: {
      lat: 19.1136,
      lng: 72.8697,
      address: 'Andheri, Mumbai, India'
    }
  },
  {
    id: 'cry-india',
    name: 'CRY (Child Rights and You)',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'New Delhi, India'
    }
  }
];

const publicVerifiedOrganizations = verifiedOrganizations.map(({ id, name, location }) => ({
  id,
  name,
  location
}));

const findVerifiedOrganization = (id) => (
  verifiedOrganizations.find((organization) => organization.id === id)
);

module.exports = {
  verifiedOrganizations,
  publicVerifiedOrganizations,
  findVerifiedOrganization
};
