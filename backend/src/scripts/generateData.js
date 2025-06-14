const fs = require('node:fs');
const path = require('node:path');
const { faker } = require('@faker-js/faker');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Generate random date between 2020 and 2024
const randomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2024, 11, 31);
    return faker.date.between({ from: start, to: end });
};

// Generate random status
const randomStatus = () => {
    return faker.helpers.arrayElement(['active', 'inactive', 'pending', 'blocked', 'suspended']);
};

// Generate random language
const randomLanguage = () => {
    return faker.helpers.arrayElement([
        'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic',
        'Hindi', 'Portuguese', 'Russian', 'Korean', 'Italian', 'Dutch', 'Turkish',
        'Polish', 'Vietnamese', 'Thai', 'Greek', 'Hebrew', 'Swedish', 'Norwegian',
        'Danish', 'Finnish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian',
        'Slovak', 'Slovenian', 'Estonian', 'Latvian', 'Lithuanian', 'Ukrainian',
        'Belarusian', 'Serbian', 'Bosnian', 'Macedonian', 'Albanian', 'Moldovan',
        'Montenegrin', 'Kosovan', 'Sindhi', 'Uyghur'
    ]);
};

// Generate random tags
const generateTags = () => {
    const tags = [
        'technology', 'science', 'art', 'music', 'sports', 'food', 'travel',
        'business', 'health', 'education', 'entertainment', 'fashion', 'gaming',
        'photography', 'writing', 'design', 'marketing', 'finance', 'law', 'medicine',
        'engineering', 'architecture', 'agriculture', 'environment', 'politics',
        'history', 'philosophy', 'psychology', 'sociology', 'anthropology'
    ];
    return faker.helpers.arrayElements(tags, { min: 1, max: 5 });
};

// Generate random metrics
const generateMetrics = () => {
    return {
        views: faker.number.int({ min: 0, max: 1000000 }),
        likes: faker.number.int({ min: 0, max: 100000 }),
        shares: faker.number.int({ min: 0, max: 50000 }),
        comments: faker.number.int({ min: 0, max: 10000 }),
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 })
    };
};

// Generate random social media profiles
const generateSocialProfiles = () => {
    return {
        twitter: faker.internet.userName(),
        facebook: faker.internet.userName(),
        instagram: faker.internet.userName(),
        linkedin: faker.internet.userName(),
        github: faker.internet.userName()
    };
};

// Generate random address
const generateAddress = () => {
    return {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        coordinates: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude()
        }
    };
};

// Generate a single record
const generateRecord = () => {
    const createdAt = randomDate();
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        bio: faker.lorem.paragraphs(2),
        age: faker.number.int({ min: 18, max: 80 }),
        language: randomLanguage(),
        status: randomStatus(),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        address: generateAddress(),
        socialProfiles: generateSocialProfiles(),
        tags: generateTags(),
        metrics: generateMetrics(),
        preferences: {
            theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
            notifications: {
                email: faker.datatype.boolean(),
                push: faker.datatype.boolean(),
                sms: faker.datatype.boolean()
            },
            privacy: {
                profileVisibility: faker.helpers.arrayElement(['public', 'private', 'friends']),
                showEmail: faker.datatype.boolean(),
                showPhone: faker.datatype.boolean()
            }
        },
        subscription: {
            plan: faker.helpers.arrayElement(['free', 'basic', 'premium', 'enterprise']),
            startDate: faker.date.past().toISOString(),
            endDate: faker.date.future().toISOString(),
            autoRenew: faker.datatype.boolean()
        },
        lastLogin: {
            timestamp: faker.date.recent().toISOString(),
            ip: faker.internet.ip(),
            device: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
            browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge'])
        }
    };
};

// Generate the dataset
const generateDataset = (count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(generateRecord());
    }
    return data;
};

// Generate and save the data
const generateAndSaveData = () => {
    const recordCount = 10000; // Generate 10,000 records
    console.log(`Generating ${recordCount} records...`);
    
    const data = generateDataset(recordCount);
    const outputPath = path.join(dataDir, 'large-dataset.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data generated and saved to ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB`);
};

generateAndSaveData(); 