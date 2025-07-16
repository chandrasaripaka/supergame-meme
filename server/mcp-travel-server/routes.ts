/**
 * MCP Travel Server API Routes
 * 
 * Provides RESTful endpoints for the MCP Travel Server tools
 */

import { Router } from 'express';
import { mcpTravelServer } from './index';
import { z } from 'zod';

const router = Router();

// Validation schemas
const flightSearchSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  date: z.string().min(1, 'Date is required'),
  travelers: z.number().min(1, 'At least 1 traveler required'),
  budget: z.number().optional(),
  returnDate: z.string().optional(),
  class: z.enum(['Economy', 'Premium Economy', 'Business', 'First']).optional()
});

const hotelSearchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required'),
  qualityTier: z.enum(['budget', 'mid-range', 'luxury']).optional(),
  rooms: z.number().min(1).optional()
});

const activitySearchSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
  duration: z.enum(['half-day', 'full-day', 'multi-day']).optional(),
  budget: z.number().optional()
});

const visaRequirementSchema = z.object({
  citizenship: z.string().min(1, 'Citizenship is required'),
  destination: z.string().min(1, 'Destination is required'),
  purpose: z.enum(['tourism', 'business', 'transit']).optional()
});

const bookingSchema = z.object({
  type: z.enum(['flight', 'hotel', 'activity', 'package']),
  bookingDetails: z.any(),
  paymentMethod: z.string().optional(),
  contactInfo: z.any().optional()
});

/**
 * POST /api/mcp/flights/search
 * Search for flights across multiple providers
 */
router.post('/flights/search', async (req, res) => {
  try {
    const params = flightSearchSchema.parse(req.body);
    const flights = await mcpTravelServer.tool_searchFlights(params);
    
    res.json({
      success: true,
      data: flights,
      count: flights.length,
      searchCriteria: params
    });
  } catch (error) {
    console.error('Error searching flights:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/mcp/hotels/search
 * Search for hotels across multiple providers
 */
router.post('/hotels/search', async (req, res) => {
  try {
    const params = hotelSearchSchema.parse(req.body);
    const hotels = await mcpTravelServer.tool_searchHotels(params);
    
    res.json({
      success: true,
      data: hotels,
      count: hotels.length,
      searchCriteria: params
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/mcp/activities/search
 * Search for activities across multiple providers
 */
router.post('/activities/search', async (req, res) => {
  try {
    const params = activitySearchSchema.parse(req.body);
    const activities = await mcpTravelServer.tool_findActivities(params);
    
    res.json({
      success: true,
      data: activities,
      count: activities.length,
      searchCriteria: params
    });
  } catch (error) {
    console.error('Error searching activities:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/mcp/visa/requirements
 * Get visa requirements for a destination
 */
router.post('/visa/requirements', async (req, res) => {
  try {
    const params = visaRequirementSchema.parse(req.body);
    const visaInfo = await mcpTravelServer.tool_getVisaRequirements(params);
    
    res.json({
      success: true,
      data: visaInfo,
      searchCriteria: params
    });
  } catch (error) {
    console.error('Error getting visa requirements:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/mcp/booking/create
 * Create a booking through the appropriate provider
 */
router.post('/booking/create', async (req, res) => {
  try {
    const params = bookingSchema.parse(req.body);
    const booking = await mcpTravelServer.tool_book(params);
    
    res.json({
      success: true,
      data: booking,
      bookingType: params.type
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/mcp/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      mcpTravelServer: 'running'
    }
  });
});

/**
 * GET /api/mcp/providers
 * Get available providers and their status
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: {
      flights: {
        amadeus: !!process.env.AMADEUS_API_KEY,
        skyscanner: !!process.env.SKYSCANNER_API_KEY,
        googleFlights: !!process.env.GOOGLE_FLIGHTS_API_KEY,
        database: true
      },
      hotels: {
        expedia: !!process.env.EXPEDIA_API_KEY,
        booking: !!process.env.BOOKING_API_KEY,
        marriott: !!process.env.MARRIOTT_API_KEY,
        database: true
      },
      activities: {
        viator: !!process.env.VIATOR_API_KEY,
        getYourGuide: !!process.env.GETYOURGUIDE_API_KEY,
        tripAdvisor: !!process.env.TRIPADVISOR_API_KEY,
        database: true
      },
      visa: {
        iataTravel: !!process.env.IATA_TRAVEL_API_KEY,
        sherpa: !!process.env.SHERPA_API_KEY,
        database: true
      }
    }
  });
});

export default router;