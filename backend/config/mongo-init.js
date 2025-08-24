// MongoDB initialization script
db = db.getSiblingDB('auramatch');

// Create collections with indexes
db.createCollection('users');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ facebookId: 1 }, { sparse: true });
db.users.createIndex({ location: 1, isActive: 1 });
db.users.createIndex({ 'matches.userId': 1 });
db.users.createIndex({ lastActive: -1 });
db.users.createIndex({ isActive: 1, isProfileComplete: 1 });

// Create a default admin user (optional)
db.users.insertOne({
  email: 'admin@auramatch.com',
  name: 'Admin AuraMatch',
  isActive: true,
  isProfileComplete: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialized for AuraMatch');