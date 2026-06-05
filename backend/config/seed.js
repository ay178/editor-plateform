require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EditorProfile = require('../models/EditorProfile');
const HiringRequest = require('../models/HiringRequest');
const Review = require('../models/Review');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await EditorProfile.deleteMany();
  await HiringRequest.deleteMany();
  await Review.deleteMany();

  // ✅ FIX: Hash password manually BEFORE insertMany
  // insertMany() does NOT trigger Mongoose pre('save') hook
  // so bcrypt hash in User model never runs → plain text stored → login fails
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create clients
  const clients = await User.insertMany([
    {
      name: 'Alex Rivera',
      email: 'alex@client.com',
      password: hashedPassword,
      role: 'client',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    },
    {
      name: 'Mia Thompson',
      email: 'mia@client.com',
      password: hashedPassword,
      role: 'client',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia'
    },
    {
      name: 'Jordan Lee',
      email: 'jordan@client.com',
      password: hashedPassword,
      role: 'client',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'
    }
  ]);

  // Create editors
  const editors = await User.insertMany([
    {
      name: 'Sofia Chen',
      email: 'sofia@editor.com',
      password: hashedPassword,
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia'
    },
    {
      name: 'Marcus Williams',
      email: 'marcus@editor.com',
      password: hashedPassword,
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
    },
    {
      name: 'Elena Rossi',
      email: 'elena@editor.com',
      password: hashedPassword,
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena'
    },
    {
      name: 'Dev Patel',
      email: 'dev@editor.com',
      password: hashedPassword,
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev'
    },
    {
      name: 'Zara Ahmed',
      email: 'zara@editor.com',
      password: hashedPassword,
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zara'
    }
  ]);

  // Create editor profiles
  const profiles = [
    {
      user: editors[0]._id,
      bio: 'Award-winning video editor with 6+ years of experience in YouTube, commercials, and short films.',
      skills: ['video-editing', 'color-grading', 'motion-graphics'],
      portfolio: [
        { title: 'Brand Commercial', url: 'https://picsum.photos/seed/sc1/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/sc1/400/250' },
        { title: 'Wedding Highlight', url: 'https://picsum.photos/seed/sc2/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/sc2/400/250' },
      ],
      pricingType: 'per-project',
      price: 350,
      experience: 6,
      software: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
      averageRating: 4.8,
      totalReviews: 24,
      completedProjects: 47,
      location: 'San Francisco, CA',
      responseTime: 'Within 2 hours',
      availability: true
    },
    {
      user: editors[1]._id,
      bio: 'Thumbnail artist and photo editor specializing in YouTube content.',
      skills: ['thumbnail-design', 'photo-editing'],
      portfolio: [
        { title: 'YouTube Thumbnails', url: 'https://picsum.photos/seed/mw1/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/mw1/400/250' },
      ],
      pricingType: 'per-project',
      price: 120,
      experience: 4,
      software: ['Photoshop', 'Canva Pro', 'Figma'],
      averageRating: 4.6,
      totalReviews: 38,
      completedProjects: 120,
      location: 'New York, NY',
      responseTime: 'Within 1 hour',
      availability: true
    },
    {
      user: editors[2]._id,
      bio: 'Freelance video editor from Milan with a passion for storytelling.',
      skills: ['video-editing', 'color-grading', 'sound-design'],
      portfolio: [
        { title: 'Documentary Short', url: 'https://picsum.photos/seed/er1/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/er1/400/250' },
      ],
      pricingType: 'hourly',
      price: 65,
      experience: 8,
      software: ['Final Cut Pro', 'Logic Pro', 'DaVinci Resolve'],
      averageRating: 4.9,
      totalReviews: 15,
      completedProjects: 62,
      location: 'Remote (Milan)',
      responseTime: 'Within 4 hours',
      availability: true
    },
    {
      user: editors[3]._id,
      bio: 'Motion graphics designer and animator.',
      skills: ['motion-graphics', 'animation', 'video-editing'],
      portfolio: [
        { title: 'Logo Animation', url: 'https://picsum.photos/seed/dp1/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/dp1/400/250' },
      ],
      pricingType: 'hourly',
      price: 85,
      experience: 5,
      software: ['After Effects', 'Cinema 4D', 'Illustrator'],
      averageRating: 4.7,
      totalReviews: 21,
      completedProjects: 35,
      location: 'Austin, TX',
      responseTime: 'Within 6 hours',
      availability: false
    },
    {
      user: editors[4]._id,
      bio: 'All-rounder creative editor specializing in social media content.',
      skills: ['video-editing', 'photo-editing', 'thumbnail-design'],
      portfolio: [
        { title: 'Instagram Reels', url: 'https://picsum.photos/seed/za1/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/za1/400/250' },
      ],
      pricingType: 'per-project',
      price: 200,
      experience: 3,
      software: ['Premiere Pro', 'Photoshop', 'CapCut'],
      averageRating: 4.4,
      totalReviews: 32,
      completedProjects: 78,
      location: 'London, UK',
      responseTime: 'Within 3 hours',
      availability: true
    }
  ];

  await EditorProfile.insertMany(profiles);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📧 Demo Accounts (password: password123):');
  console.log('  CLIENT: alex@client.com');
  console.log('  CLIENT: mia@client.com');
  console.log('  CLIENT: jordan@client.com');
  console.log('  EDITOR: sofia@editor.com');
  console.log('  EDITOR: marcus@editor.com');
  console.log('  EDITOR: elena@editor.com');
  console.log('  EDITOR: dev@editor.com');
  console.log('  EDITOR: zara@editor.com');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
