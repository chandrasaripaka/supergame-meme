/**
 * Travel Buddy A2A Framework - Index
 * 
 * This file exports all components of the A2A framework for easy imports
 */

// Export types
export * from './types';

// Export base agent
export * from './BaseAgent';

// Export agent orchestrator
export * from './AgentOrchestrator';

// Export specialized agents
export * from './TravelSafetyAgent';
export * from './FlightBookingAgent';
export * from './AccommodationAgent';

// Export demo functions
import { v4 as uuidv4 } from 'uuid';
import { AgentOrchestrator } from './AgentOrchestrator';
import { TravelSafetyAgent } from './TravelSafetyAgent';
import { FlightBookingAgent } from './FlightBookingAgent';
import { AccommodationAgent } from './AccommodationAgent';
import { AgentType, TaskPriority, Task } from './types';

/**
 * Demonstrate the agent collaboration workflow with a real travel planning scenario
 */
export async function demonstrateTravelPlan(
  destination: string,
  departureDate: string,
  returnDate: string,
  budget: number
): Promise<{
  workflowId: string;
  tasks: Task[];
  safety: any;
  flights: any;
  hotels: any;
}> {
  const workflowId = uuidv4();
  
  // Create orchestrator and register agents
  const orchestrator = new AgentOrchestrator();
  
  // Register specialized agents
  orchestrator.registerAgent(new TravelSafetyAgent());
  orchestrator.registerAgent(new FlightBookingAgent());
  orchestrator.registerAgent(new AccommodationAgent());
  
  console.log(`[Workflow ${workflowId}] Starting travel planning to ${destination}`);
  
  // First, create a task to check destination safety
  const safetyTask = orchestrator.createTask(
    `Check safety for ${destination}`,
    `Check if ${destination} has any travel advisories or safety concerns`,
    AgentType.TRAVEL_SAFETY,
    {
      action: 'check_destination_safety',
      destination
    },
    TaskPriority.HIGH
  );
  
  // Wait a moment for the task to be processed (simulating async work)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get updated safety task with results
  const updatedSafetyTask = orchestrator.getTask(safetyTask.id);
  
  // Prepare flight search task
  let flightSearchTask;
  
  // Only search for flights if destination is safe or if safety check failed
  if (!updatedSafetyTask?.result || 
      updatedSafetyTask.result.success === false || 
      (updatedSafetyTask.result.data && updatedSafetyTask.result.data.safe !== false)) {
    
    const departureCity = 'New York'; // Default departure city for demo
    
    flightSearchTask = orchestrator.createTask(
      `Search flights to ${destination}`,
      `Find flights from ${departureCity} to ${destination}`,
      AgentType.FLIGHT_BOOKING,
      {
        action: 'search_flights',
        departureCity,
        arrivalCity: destination,
        departureDate,
        returnDate,
        skipSafetyCheck: true // Skip since we already checked
      },
      TaskPriority.MEDIUM
    );
  }
  
  // Wait a moment for the task to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get updated flight task
  const updatedFlightTask = flightSearchTask 
    ? orchestrator.getTask(flightSearchTask.id) 
    : null;
  
  // Prepare hotel search task
  let hotelSearchTask;
  
  // Only search for hotels if destination is safe
  if (!updatedSafetyTask?.result || 
      updatedSafetyTask.result.success === false || 
      (updatedSafetyTask.result.data && updatedSafetyTask.result.data.safe !== false)) {
    
    const checkIn = departureDate;
    const checkOut = returnDate;
    
    // Calculate max price per night based on budget
    const days = Math.round((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24));
    const maxPricePerNight = Math.round(budget * 0.4 / days); // Allocate 40% of budget to accommodation
    
    hotelSearchTask = orchestrator.createTask(
      `Search hotels in ${destination}`,
      `Find available hotels in ${destination} for dates ${checkIn} to ${checkOut}`,
      AgentType.ACCOMMODATION,
      {
        action: 'search_hotels',
        location: destination,
        checkIn,
        checkOut,
        guests: 2,
        maxPrice: maxPricePerNight,
        skipSafetyCheck: true // Skip since we already checked
      },
      TaskPriority.MEDIUM
    );
  }
  
  // Wait a moment for the task to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get updated hotel task
  const updatedHotelTask = hotelSearchTask 
    ? orchestrator.getTask(hotelSearchTask.id) 
    : null;
  
  // Gather all tasks for review
  const allTasks = orchestrator.getAllTasks();
  
  return {
    workflowId,
    tasks: allTasks,
    safety: updatedSafetyTask?.result?.data || null,
    flights: updatedFlightTask?.result?.data || null,
    hotels: updatedHotelTask?.result?.data || null
  };
}