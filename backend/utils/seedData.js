const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@skillswap.com' 
    });

    if (!adminExists) {
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL || 'admin@skillswap.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isPublic: false,
        skillsOffered: ['Platform Management', 'User Support'],
        skillsWanted: [],
        availability: ['Flexible'],
        bio: 'Platform administrator account'
      });

      console.log('Admin user created successfully');
      console.log('Email:', adminUser.email);
      console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

const seedSampleUsers = async () => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    
    if (userCount === 0) {
      const sampleUsers = [
        {
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah@example.com',
          password: 'password123',
          location: 'San Francisco, CA',
          bio: 'Graphic designer with 5+ years of experience. Love creating beautiful designs and helping others learn.',
          skillsOffered: ['Graphic Design', 'Adobe Photoshop', 'Branding', 'Logo Design'],
          skillsWanted: ['Web Development', 'React', 'UI/UX Design'],
          availability: ['Weekends', 'Evenings'],
          rating: 4.9,
          totalRatings: 15,
          completedSwaps: 15
        },
        {
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike@example.com',
          password: 'password123',
          location: 'New York, NY',
          bio: 'Professional photographer and photo editor. Passionate about capturing moments and teaching photography.',
          skillsOffered: ['Photography', 'Photo Editing', 'Lightroom', 'Portrait Photography'],
          skillsWanted: ['Video Editing', 'Motion Graphics', 'After Effects'],
          availability: ['Weekdays', 'Mornings'],
          rating: 4.7,
          totalRatings: 23,
          completedSwaps: 23
        },
        {
          firstName: 'Emma',
          lastName: 'Davis',
          email: 'emma@example.com',
          password: 'password123',
          location: 'Austin, TX',
          bio: 'UX/UI designer focused on creating user-centered designs. Love collaborating and sharing design knowledge.',
          skillsOffered: ['UI/UX Design', 'Figma', 'User Research', 'Wireframing'],
          skillsWanted: ['Frontend Development', 'CSS', 'JavaScript'],
          availability: ['Flexible'],
          rating: 4.8,
          totalRatings: 18,
          completedSwaps: 18
        },
        {
          firstName: 'Alex',
          lastName: 'Rodriguez',
          email: 'alex@example.com',
          password: 'password123',
          location: 'Los Angeles, CA',
          bio: 'Digital marketing specialist with expertise in SEO and content strategy. Always eager to share knowledge.',
          skillsOffered: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media Marketing'],
          skillsWanted: ['Data Analysis', 'Python', 'Google Analytics'],
          availability: ['Evenings', 'Weekends'],
          rating: 4.6,
          totalRatings: 12,
          completedSwaps: 12
        },
        {
          firstName: 'Lisa',
          lastName: 'Park',
          email: 'lisa@example.com',
          password: 'password123',
          location: 'Seattle, WA',
          bio: 'Data scientist and Python developer. Love working with data and teaching others programming skills.',
          skillsOffered: ['Data Science', 'Python', 'Machine Learning', 'SQL'],
          skillsWanted: ['Public Speaking', 'Presentation Skills', 'Leadership'],
          availability: ['Weekdays'],
          rating: 4.9,
          totalRatings: 27,
          completedSwaps: 27
        }
      ];

      await User.insertMany(sampleUsers);
      console.log('Sample users created successfully');
    } else {
      console.log('Sample users already exist');
    }
  } catch (error) {
    console.error('Error seeding sample users:', error);
  }
};

module.exports = {
  seedAdmin,
  seedSampleUsers
};
