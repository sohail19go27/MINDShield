const mongoose = require('mongoose');
const Priority = require('./models/Priority');
const Reflection = require('./models/Reflection');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindshield';

async function addTestData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Create a valid ObjectId for testing
    const userId = new mongoose.Types.ObjectId().toString();
    console.log('Using test userId:', userId);

    // Add test priorities
    const priority1 = await Priority.create({
      userId,
      title: 'Complete project documentation',
      status: 'active',
      completed: false,
      createdAt: new Date()
    });

    const priority2 = await Priority.create({
      userId,
      title: 'Review weekly goals',
      status: 'active',
      completed: false,
      createdAt: new Date()
    });

    console.log('Created test priorities:', priority1.title, priority2.title);

    // Add test reflection
    const reflection = await Reflection.create({
      userId,
      answers: {
        moralLessons: 'Patience is key when dealing with complex problems',
        whatMakeDayBetter: 'Better time management',
        preSleepHappiness: 'Completing major tasks',
        planTomorrow: 'Start early and prioritize',
        gratitude: 'Grateful for supportive team'
      },
      createdAt: new Date()
    });

    console.log('Created test reflection');

    // Query and display all data for verification
    const priorities = await Priority.find({ userId });
    const reflections = await Reflection.find({ userId });

    console.log('\nVerification:');
    console.log('Priorities:', priorities.length);
    console.log('Reflections:', reflections.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestData();