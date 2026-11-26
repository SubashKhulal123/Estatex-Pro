require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected for seeding...');
};

const users = [
  {
    firstName: 'Super', lastName: 'Admin',
    email: 'superadmin@estatex.com', password: 'Admin@123',
    role: 'super_admin', isActive: true, isEmailVerified: true,
    phone: '+1-555-0100', city: 'New York', country: 'USA',
    bio: 'Platform super administrator'
  },
  {
    firstName: 'Alex', lastName: 'Admin',
    email: 'admin@estatex.com', password: 'Admin@123',
    role: 'admin', isActive: true, isEmailVerified: true,
    phone: '+1-555-0101', city: 'Los Angeles', country: 'USA',
    bio: 'Platform administrator'
  },
  {
    firstName: 'James', lastName: 'Wilson',
    email: 'agent@estatex.com', password: 'Admin@123',
    role: 'agent', isActive: true, isEmailVerified: true,
    phone: '+1-555-0102', city: 'Miami', country: 'USA',
    bio: 'Senior real estate agent with 10+ years experience'
  },
  {
    firstName: 'Sarah', lastName: 'Davis',
    email: 'agent2@estatex.com', password: 'Admin@123',
    role: 'agent', isActive: true, isEmailVerified: true,
    phone: '+1-555-0103', city: 'Chicago', country: 'USA',
    bio: 'Luxury property specialist'
  },
  {
    firstName: 'Mike', lastName: 'Johnson',
    email: 'manager@estatex.com', password: 'Admin@123',
    role: 'property_manager', isActive: true, isEmailVerified: true,
    phone: '+1-555-0104', city: 'Seattle', country: 'USA',
    bio: 'Property manager for residential and commercial properties'
  },
  {
    firstName: 'Emily', lastName: 'Brown',
    email: 'customer@estatex.com', password: 'Admin@123',
    role: 'customer', isActive: true, isEmailVerified: true,
    phone: '+1-555-0105', city: 'Boston', country: 'USA',
    bio: 'Looking for my dream home'
  },
];

const getProperties = (agentId, agent2Id) => [
  {
    title: 'Luxury Ocean View Villa',
    description: 'Stunning oceanfront villa with panoramic views of the Atlantic. Features 5 bedrooms, chef kitchen, home theater, and private pool.',
    price: 4500000, priceType: 'sale', category: 'luxury',
    propertyType: 'villa', status: 'available',
    address: '123 Ocean Drive', city: 'Miami', state: 'FL', country: 'USA', zipCode: '33139',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    bedrooms: 5, bathrooms: 4, area: 6500, areaUnit: 'sqft', yearBuilt: 2020,
    parking: 3, floors: 3,
    features: ['Ocean View', 'Smart Home', 'Private Pool', 'Home Theater', 'Wine Cellar'],
    amenities: ['Swimming Pool', 'Gym', 'Sauna', 'BBQ Area', 'Concierge'],
    images: [], thumbnail: '',
    agent: agentId, isFeatured: true, isTrending: true, views: 1250,
  },
  {
    title: 'Modern Downtown Penthouse',
    description: 'Ultra-modern penthouse in the heart of downtown with 360-degree city views, designer finishes, and rooftop terrace.',
    price: 8500, priceType: 'rent', category: 'luxury',
    propertyType: 'penthouse', status: 'available',
    address: '500 Brickell Ave, PH', city: 'Miami', state: 'FL', country: 'USA', zipCode: '33131',
    coordinates: { lat: 25.7580, lng: -80.1942 },
    bedrooms: 3, bathrooms: 3, area: 3200, areaUnit: 'sqft', yearBuilt: 2022,
    parking: 2, floors: 1,
    features: ['360° City Views', 'Rooftop Terrace', 'Designer Kitchen', 'Smart Home'],
    amenities: ['Concierge', 'Valet Parking', 'Sky Pool', 'Fitness Center'],
    images: [], thumbnail: '',
    agent: agentId, isFeatured: true, views: 890,
  },
  {
    title: 'Cozy Family Home in Suburbs',
    description: 'Beautiful 4-bedroom family home with spacious backyard, updated kitchen, and great school district.',
    price: 750000, priceType: 'sale', category: 'residential',
    propertyType: 'house', status: 'available',
    address: '45 Maple Street', city: 'Chicago', state: 'IL', country: 'USA', zipCode: '60601',
    coordinates: { lat: 41.8827, lng: -87.6233 },
    bedrooms: 4, bathrooms: 3, area: 2800, areaUnit: 'sqft', yearBuilt: 2015,
    parking: 2, floors: 2,
    features: ['Spacious Backyard', 'Updated Kitchen', 'Hardwood Floors', 'Fireplace'],
    amenities: ['Garage', 'Garden', 'Patio'],
    images: [], thumbnail: '',
    agent: agent2Id, isFeatured: false, isTrending: true, views: 540,
  },
  {
    title: 'Studio Apartment - City Center',
    description: 'Stylish studio apartment perfect for young professionals. Walking distance to everything.',
    price: 2200, priceType: 'rent', category: 'residential',
    propertyType: 'studio', status: 'available',
    address: '88 Michigan Ave', city: 'Chicago', state: 'IL', country: 'USA', zipCode: '60602',
    coordinates: { lat: 41.8805, lng: -87.6245 },
    bedrooms: 0, bathrooms: 1, area: 550, areaUnit: 'sqft', yearBuilt: 2018,
    parking: 0, floors: 1,
    features: ['City View', 'Modern Appliances', 'In-unit Laundry'],
    amenities: ['Doorman', 'Rooftop Deck', 'Bike Storage'],
    images: [], thumbnail: '',
    agent: agent2Id, views: 320,
  },
  {
    title: 'Commercial Office Space Downtown',
    description: 'Premium Grade-A office space in prime downtown location. Ideal for tech companies and law firms.',
    price: 12500, priceType: 'rent', category: 'commercial',
    propertyType: 'office', status: 'available',
    address: '1 Financial Plaza', city: 'New York', state: 'NY', country: 'USA', zipCode: '10004',
    coordinates: { lat: 40.7074, lng: -74.0113 },
    bedrooms: 0, bathrooms: 4, area: 5000, areaUnit: 'sqft', yearBuilt: 2019,
    parking: 10, floors: 1,
    features: ['Open Floor Plan', 'Server Room', 'Conference Rooms', 'Reception'],
    amenities: ['24/7 Security', 'High-speed Internet', 'Parking', 'Cafeteria'],
    images: [], thumbnail: '',
    agent: agentId, views: 445,
  },
  {
    title: 'Waterfront Condo with Marina Access',
    description: 'Gorgeous waterfront condo with direct marina access. Updated throughout with premium finishes.',
    price: 1250000, priceType: 'sale', category: 'residential',
    propertyType: 'apartment', status: 'available',
    address: '200 Marina Bay', city: 'Seattle', state: 'WA', country: 'USA', zipCode: '98101',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    bedrooms: 2, bathrooms: 2, area: 1800, areaUnit: 'sqft', yearBuilt: 2017,
    parking: 1, floors: 1,
    features: ['Marina Access', 'Water Views', 'Balcony', 'Updated Kitchen'],
    amenities: ['Boat Slip', 'Pool', 'Clubhouse', 'Fitness Center'],
    images: [], thumbnail: '',
    agent: agentId, isFeatured: true, views: 780,
  },
  {
    title: 'Mountain Retreat Cabin',
    description: 'Charming log cabin nestled in the mountains with breathtaking views and complete privacy.',
    price: 895000, priceType: 'sale', category: 'residential',
    propertyType: 'house', status: 'available',
    address: '123 Pine Ridge Road', city: 'Denver', state: 'CO', country: 'USA', zipCode: '80202',
    coordinates: { lat: 39.7392, lng: -104.9903 },
    bedrooms: 3, bathrooms: 2, area: 2200, areaUnit: 'sqft', yearBuilt: 2010,
    parking: 2, floors: 2,
    features: ['Mountain Views', 'Log Fireplace', 'Wraparound Deck', 'Hot Tub'],
    amenities: ['Ski Access', 'Hiking Trails', 'Garage'],
    images: [], thumbnail: '',
    agent: agent2Id, isTrending: true, views: 620,
  },
  {
    title: 'Industrial Warehouse Space',
    description: 'Large industrial warehouse perfect for logistics, manufacturing, or creative studio space.',
    price: 6500, priceType: 'rent', category: 'industrial',
    propertyType: 'warehouse', status: 'available',
    address: '500 Industrial Blvd', city: 'Houston', state: 'TX', country: 'USA', zipCode: '77001',
    coordinates: { lat: 29.7604, lng: -95.3698 },
    bedrooms: 0, bathrooms: 2, area: 15000, areaUnit: 'sqft', yearBuilt: 2005,
    parking: 20, floors: 1,
    features: ['Loading Dock', 'High Ceilings', 'Drive-in Access', 'Office Area'],
    amenities: ['24/7 Access', 'Security System', 'Freight Elevator'],
    images: [], thumbnail: '',
    agent: agentId, views: 210,
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑  Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});

    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    const agentUser = createdUsers.find(u => u.email === 'agent@estatex.com');
    const agent2User = createdUsers.find(u => u.email === 'agent2@estatex.com');
    const customerUser = createdUsers.find(u => u.email === 'customer@estatex.com');

    console.log('🏠 Creating properties...');
    const properties = getProperties(agentUser._id, agent2User._id);
    const createdProperties = await Property.create(properties);

    console.log('📅 Creating sample bookings...');
    await Booking.create([
      {
        property: createdProperties[0]._id,
        customer: customerUser._id,
        agent: agentUser._id,
        visitDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        visitTime: '10:00 AM',
        status: 'approved',
        message: 'I am very interested in this property. Would love to schedule a visit.',
        agentNotes: 'Customer is pre-approved for financing.'
      },
      {
        property: createdProperties[2]._id,
        customer: customerUser._id,
        agent: agent2User._id,
        visitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        visitTime: '2:00 PM',
        status: 'pending',
        message: 'Looking for a family home. This looks perfect!'
      }
    ]);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('=== DEFAULT LOGIN CREDENTIALS ===');
    console.log('Super Admin: superadmin@estatex.com / Admin@123');
    console.log('Admin:       admin@estatex.com / Admin@123');
    console.log('Agent:       agent@estatex.com / Admin@123');
    console.log('Customer:    customer@estatex.com / Admin@123');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
