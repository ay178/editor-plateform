require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const EditorProfile = require('../models/Editorprofile');
const HiringRequest = require('../models/HiringRequest');
const Review = require('../models/Review');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await EditorProfile.deleteMany();
  await HiringRequest.deleteMany();
  await Review.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  // Create clients
  const clients = await User.insertMany([
    { name: 'Alex Rivera', email: 'alex@client.com', password: passwordHash, role: 'client', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    { name: 'Mia Thompson', email: 'mia@client.com', password: passwordHash, role: 'client', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia' },
    { name: 'Jordan Lee', email: 'jordan@client.com', password: passwordHash, role: 'client', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan' }
  ]);

  // Create editors
  const editors = await User.insertMany([
    { name: 'Sofia Chen', email: 'sofia@editor.com', password: passwordHash, role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia' },
    { name: 'Marcus Williams', email: 'marcus@editor.com', password: passwordHash, role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
    { name: 'Elena Rossi', email: 'elena@editor.com', password: passwordHash, role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena' },
    { name: 'Dev Patel', email: 'dev@editor.com', password: passwordHash, role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev' },
    { name: 'Zara Ahmed', email: 'zara@editor.com', password: passwordHash, role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zara' }
  ]);

  // Create editor profiles
  const profiles = [
    {
      user: editors[0]._id,
      bio: 'Award-winning video editor with 6+ years of experience in YouTube, commercials, and short films. I bring stories to life with cinematic precision.',
      skills: ['video-editing', 'color-grading', 'motion-graphics'],
      portfolio: [
        { title: 'Brand Commercial', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', thumbnail: 'https://picsum.photos/seed/p1/400/250' },
        { title: 'Wedding Highlight', url: 'https://picsum.photos/seed/p2/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p2/400/250' },
        { title: 'Travel Vlog', url: 'https://picsum.photos/seed/p3/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p3/400/250' }
      ],
      pricingType: 'per-project', price: 350, experience: 6,
      software: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
      averageRating: 4.8, totalReviews: 24, completedProjects: 47,
      location: 'San Francisco, CA', responseTime: 'Within 2 hours'
    },
    {
      user: editors[1]._id,
      bio: 'Thumbnail artist and photo editor specializing in YouTube content. My thumbnails consistently achieve 8-12% CTR for my clients.',
      skills: ['thumbnail-design', 'photo-editing'],
      portfolio: [
        { title: 'YouTube Thumbnail Pack', url: 'https://picsum.photos/seed/p4/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p4/400/250' },
        { title: 'Product Photography', url: 'https://picsum.photos/seed/p5/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p5/400/250' }
      ],
      pricingType: 'per-project', price: 120, experience: 4,
      software: ['Photoshop', 'Canva Pro', 'Figma'],
      averageRating: 4.6, totalReviews: 38, completedProjects: 120,
      location: 'New York, NY', responseTime: 'Within 1 hour'
    },
    {
      user: editors[2]._id,
      bio: 'Freelance video editor from Milan with a passion for storytelling. Specializing in documentary and narrative content with rich color grading.',
      skills: ['video-editing', 'color-grading', 'sound-design'],
      portfolio: [
        { title: 'Documentary Short', url: 'https://picsum.photos/seed/p6/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p6/400/250' }
      ],
      pricingType: 'hourly', price: 65, experience: 8,
      software: ['Final Cut Pro', 'Logic Pro', 'DaVinci Resolve'],
      averageRating: 4.9, totalReviews: 15, completedProjects: 62,
      location: 'Remote (Milan)', responseTime: 'Within 4 hours'
    },
    {
      user: editors[3]._id,
      bio: 'Motion graphics designer and animator. I create eye-catching intros, lower thirds, and animated explainer videos.',
      skills: ['motion-graphics', 'animation', 'video-editing'],
      portfolio: [
        { title: 'Logo Animation', url: 'https://picsum.photos/seed/p7/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p7/400/250' },
        { title: 'Explainer Video', url: 'https://picsum.photos/seed/p8/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p8/400/250' }
      ],
      pricingType: 'hourly', price: 85, experience: 5,
      software: ['After Effects', 'Cinema 4D', 'Illustrator'],
      averageRating: 4.7, totalReviews: 21, completedProjects: 35,
      location: 'Austin, TX', responseTime: 'Within 6 hours'
    },
    {
      user: editors[4]._id,
      bio: 'All-rounder creative editor specializing in social media content. Fast turnaround, modern aesthetics, and great communication.',
      skills: ['video-editing', 'photo-editing', 'thumbnail-design'],
      portfolio: [
        { title: 'Instagram Reels', url: 'https://picsum.photos/seed/p9/400/250', type: 'image', thumbnail: 'https://picsum.photos/seed/p9/400/250' }
      ],
      pricingType: 'per-project', price: 200, experience: 3,
      software: ['Premiere Pro', 'Photoshop', 'CapCut'],
      averageRating: 4.4, totalReviews: 32, completedProjects: 78,
      location: 'London, UK', responseTime: 'Within 3 hours'
    }
  ];

  await EditorProfile.insertMany(profiles);

  // Create some hiring requests
  const requests = await HiringRequest.insertMany([
    {
      client: clients[0]._id, editor: editors[0]._id,
      projectTitle: 'YouTube Travel Vlog Edit',
      description: 'Need a 15-minute travel vlog edited from 2 hours of raw footage.',
      budget: 400, status: 'completed', skills: ['video-editing', 'color-grading'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      client: clients[1]._id, editor: editors[1]._id,
      projectTitle: 'Thumbnail Set for Gaming Channel',
      description: '10 thumbnails for my gaming YouTube channel.',
      budget: 150, status: 'accepted', skills: ['thumbnail-design']
    },
    {
      client: clients[2]._id, editor: editors[2]._id,
      projectTitle: 'Brand Documentary',
      description: '5-minute brand story documentary edit.',
      budget: 800, status: 'pending', skills: ['video-editing', 'color-grading']
    }
  ]);

  // Create reviews for completed projects
  await Review.create({
    client: clients[0]._id, editor: editors[0]._id,
    hiringRequest: requests[0]._id,
    rating: 5, comment: 'Sofia is absolutely incredible! Delivered a cinematic masterpiece from my shaky vacation footage. Will definitely hire again.'
  });

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📧 Demo Accounts (password: password123):');
  console.log('  CLIENT: alex@client.com');
  console.log('  CLIENT: mia@client.com');
  console.log('  EDITOR: sofia@editor.com');
  console.log('  EDITOR: marcus@editor.com');
  console.log('  EDITOR: elena@editor.com');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
