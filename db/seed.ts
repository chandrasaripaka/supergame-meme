import { db } from "./index";
import { attractions, users, insertAttractionSchema } from "@shared/schema";

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

    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
