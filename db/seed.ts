import { db } from "./index";
import { attractions, users, companions, insertAttractionSchema, insertCompanionSchema } from "@shared/schema";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Seed attractions data for popular destinations
    const attractionsData = [
      // Paris Attractions
      {
        name: "Louvre Museum",
        location: "Paris",
        description: "World's largest art museum and a historic monument in Paris, France.",
        imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.5",
        type: "museum"
      },
      {
        name: "Eiffel Tower",
        location: "Paris",
        description: "Wrought-iron lattice tower on the Champ de Mars in Paris, France.",
        imageUrl: "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        type: "landmark"
      },
      {
        name: "Notre-Dame Cathedral",
        location: "Paris",
        description: "Medieval Catholic cathedral on the Île de la Cité in Paris, France.",
        imageUrl: "https://images.unsplash.com/photo-1544594376-0a9a1b0d93a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.0",
        type: "religious_site"
      },
      
      // New York Attractions
      {
        name: "Statue of Liberty",
        location: "New York",
        description: "Colossal neoclassical sculpture on Liberty Island in New York Harbor.",
        imageUrl: "https://images.unsplash.com/photo-1492666673288-3c4b4576ad9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        type: "landmark"
      },
      {
        name: "Central Park",
        location: "New York",
        description: "Urban park in Manhattan, New York City, between the Upper West and Upper East Sides.",
        imageUrl: "https://images.unsplash.com/photo-1570168007291-0b3082bbe23f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        type: "park"
      },
      {
        name: "Metropolitan Museum of Art",
        location: "New York",
        description: "Art museum in New York City, the largest art museum in the United States.",
        imageUrl: "https://images.unsplash.com/photo-1583784561125-cf7f4299cf37?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        type: "museum"
      },
      
      // Tokyo Attractions
      {
        name: "Tokyo Skytree",
        location: "Tokyo",
        description: "Broadcasting and observation tower in Sumida, Tokyo, Japan.",
        imageUrl: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.5",
        type: "landmark"
      },
      {
        name: "Senso-ji Temple",
        location: "Tokyo",
        description: "Ancient Buddhist temple located in Asakusa, Tokyo, Japan.",
        imageUrl: "https://images.unsplash.com/photo-1583889630762-5ee52a9e3400?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        type: "religious_site"
      },
      {
        name: "Shinjuku Gyoen National Garden",
        location: "Tokyo",
        description: "Large park and garden in Shinjuku and Shibuya, Tokyo, Japan.",
        imageUrl: "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: "4.6",
        type: "park"
      }
    ];

    // Ensure validated data
    const validatedAttractions = attractionsData.map(attraction => 
      insertAttractionSchema.parse(attraction)
    );

    // Check if attractions already exist
    const existingAttractions = await db.query.attractions.findMany();
    
    if (existingAttractions.length === 0) {
      // Insert attractions data
      console.log("Inserting attractions data...");
      await db.insert(attractions).values(validatedAttractions);
      console.log(`Inserted ${validatedAttractions.length} attractions`);
    } else {
      console.log("Attractions data already exists, skipping seed");
    }

    // Seed travel companions data
    const companionsData = [
      {
        name: "Alex Rivera",
        bio: "Seasoned backpacker with over 40 countries under my belt. I specialize in outdoor adventures and off-the-beaten-path experiences. I'm easy-going, adaptable, and always ready for an impromptu side trip!",
        age: 32,
        gender: "male",
        interests: ["hiking", "photography", "local cuisine", "cultural immersion"],
        languages: ["English", "Spanish", "Portuguese"],
        travelStyle: "adventurous",
        availabilityStart: new Date("2025-06-01"),
        availabilityEnd: new Date("2025-09-30"),
        preferredDestinations: ["South America", "Southeast Asia", "Eastern Europe"],
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Maya Johnson",
        bio: "Luxury travel enthusiast with a passion for fine dining and cultural experiences. I love exploring museums, art galleries, and attending local performances. I value comfort but am always open to authentic local experiences.",
        age: 35,
        gender: "female",
        interests: ["art", "fine dining", "museums", "architecture", "spa"],
        languages: ["English", "French", "Italian"],
        travelStyle: "luxury",
        availabilityStart: new Date("2025-05-15"),
        availabilityEnd: new Date("2025-08-15"),
        preferredDestinations: ["Western Europe", "Japan", "New York"],
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Carlos Mendoza",
        bio: "Urban explorer and digital nomad. I love discovering hidden gems in cities, from underground music venues to hole-in-the-wall eateries. I'm tech-savvy and can help navigate any city with ease.",
        age: 28,
        gender: "male",
        interests: ["urban exploration", "street food", "nightlife", "coffee culture", "coworking spaces"],
        languages: ["English", "Spanish"],
        travelStyle: "urban",
        availabilityStart: new Date("2025-07-01"),
        availabilityEnd: new Date("2025-10-31"),
        preferredDestinations: ["Berlin", "Tokyo", "Mexico City", "Buenos Aires"],
        avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Sarah Chen",
        bio: "Eco-conscious traveler focusing on sustainable tourism. I enjoy nature, wildlife, and supporting local communities. I'm organized, mindful, and prefer authentic experiences over tourist traps.",
        age: 30,
        gender: "female",
        interests: ["ecotourism", "wildlife", "local crafts", "sustainable living", "hiking"],
        languages: ["English", "Mandarin", "Thai"],
        travelStyle: "eco-friendly",
        availabilityStart: new Date("2025-06-15"),
        availabilityEnd: new Date("2025-09-15"),
        preferredDestinations: ["Costa Rica", "New Zealand", "Bhutan", "Scandinavia"],
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "James Wilson",
        bio: "History buff and seasoned road-tripper. I love exploring historical sites, museums, and learning about local cultures. I'm excellent at planning routes and finding the most interesting stops along the way.",
        age: 42,
        gender: "male",
        interests: ["history", "museums", "road trips", "architecture", "local breweries"],
        languages: ["English", "German"],
        travelStyle: "cultural",
        availabilityStart: new Date("2025-05-01"),
        availabilityEnd: new Date("2025-08-31"),
        preferredDestinations: ["Central Europe", "US National Parks", "UK", "Greece"],
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Emma Thompson",
        bio: "Foodie traveler on a mission to taste the world. I organize my trips around culinary experiences, from street food to cooking classes. I'm social, love meeting locals, and always know where to find the best local dishes.",
        age: 33,
        gender: "female",
        interests: ["food tours", "cooking classes", "markets", "wine tasting", "culinary traditions"],
        languages: ["English", "French"],
        travelStyle: "culinary",
        availabilityStart: new Date("2025-06-01"),
        availabilityEnd: new Date("2025-09-30"),
        preferredDestinations: ["Italy", "Thailand", "France", "Japan", "Spain"],
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Raj Patel",
        bio: "Budget traveler with expertise in maximizing experiences while minimizing costs. I've mastered the art of finding deals, free activities, and affordable accommodations without sacrificing quality experiences.",
        age: 27,
        gender: "male",
        interests: ["budget travel", "hostels", "public transportation", "free attractions", "local street food"],
        languages: ["English", "Hindi", "Urdu"],
        travelStyle: "budget",
        availabilityStart: new Date("2025-07-15"),
        availabilityEnd: new Date("2025-11-15"),
        preferredDestinations: ["Southeast Asia", "Eastern Europe", "South America", "India"],
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Sofia Rodriguez",
        bio: "Adventure sports enthusiast always looking for the next adrenaline rush. I specialize in planning trips around outdoor activities from surfing to rock climbing. I'm energetic, positive, and safety-conscious.",
        age: 29,
        gender: "female",
        interests: ["surfing", "rock climbing", "scuba diving", "paragliding", "hiking"],
        languages: ["English", "Spanish"],
        travelStyle: "adventure",
        availabilityStart: new Date("2025-06-01"),
        availabilityEnd: new Date("2025-10-31"),
        preferredDestinations: ["New Zealand", "Costa Rica", "Norway", "Switzerland", "Peru"],
        avatarUrl: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
      }
    ];

    // Ensure validated companion data
    const validatedCompanions = companionsData.map(companion => 
      insertCompanionSchema.parse(companion)
    );

    // Check if companions already exist
    const existingCompanions = await db.query.companions.findMany();
    
    if (existingCompanions.length === 0) {
      // Insert companions data
      console.log("Inserting travel companions data...");
      await db.insert(companions).values(validatedCompanions);
      console.log(`Inserted ${validatedCompanions.length} travel companions`);
    } else {
      console.log("Travel companions data already exists, skipping seed");
    }

    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
