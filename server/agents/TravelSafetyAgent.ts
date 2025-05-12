/**
 * Travel Safety Agent
 * 
 * Specialized agent for handling travel safety-related tasks
 * Integrates with existing travel safety service
 */

import { BaseAgent } from './BaseAgent';
import { 
  AgentType, 
  Task, 
  TaskStatus, 
  AgentMessage,
  TaskResult,
  AgentCapability
} from './types';
import { 
  checkDestinationSafety, 
  getHighRiskDestinations, 
  getSafetyInfo, 
  hasSanctions,
  SafetyLevel 
} from '../services/travel-safety';

export class TravelSafetyAgent extends BaseAgent {
  constructor(name: string = 'Travel Safety Agent') {
    super(name, AgentType.TRAVEL_SAFETY);
    this.registerCapabilities();
  }

  /**
   * Register the capabilities of this agent
   */
  private registerCapabilities(): void {
    // Check destination safety capability
    this.registerCapability({
      action: 'check_destination_safety',
      description: 'Check if a destination has any travel advisories or safety concerns',
      parameters: {
        destination: {
          type: 'string',
          description: 'The name of the destination to check'
        }
      },
      examples: [
        {
          destination: 'Ukraine',
          result: {
            safe: false,
            advisory: {
              level: 'do_not_travel',
              reason: ['war', 'armed conflict']
            }
          }
        }
      ]
    });

    // Get high-risk destinations capability
    this.registerCapability({
      action: 'get_high_risk_destinations',
      description: 'Get a list of all destinations with severe travel warnings',
      parameters: {},
      examples: [
        {
          result: {
            destinations: ['Ukraine', 'Syria', 'Yemen']
          }
        }
      ]
    });

    // Check if country has sanctions capability
    this.registerCapability({
      action: 'check_sanctions',
      description: 'Check if a country has international sanctions that may affect travel',
      parameters: {
        country: {
          type: 'string',
          description: 'The name of the country to check'
        }
      },
      examples: [
        {
          country: 'Iran',
          result: {
            hasSanctions: true
          }
        }
      ]
    });

    // Suggest safe alternatives capability
    this.registerCapability({
      action: 'suggest_safe_alternatives',
      description: 'Suggest safer alternative destinations in the same region',
      parameters: {
        destination: {
          type: 'string',
          description: 'The original destination that has safety concerns'
        },
        region: {
          type: 'string',
          description: 'The broader region to find alternatives in',
          required: false
        }
      }
    });
  }

  /**
   * Handle task assignment
   */
  protected async handleTaskAssignment(task: Task): Promise<void> {
    this.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
    
    try {
      let result: TaskResult;
      
      // Determine which capability to execute based on task context
      const action = task.context.action;
      
      switch (action) {
        case 'check_destination_safety':
          result = await this.checkDestinationSafety(task);
          break;
        case 'get_high_risk_destinations':
          result = await this.getHighRiskDestinations(task);
          break;
        case 'check_sanctions':
          result = await this.checkSanctions(task);
          break;
        case 'suggest_safe_alternatives':
          result = await this.suggestSafeAlternatives(task);
          break;
        default:
          result = {
            success: false,
            error: `Unknown action: ${action}`
          };
      }
      
      this.completeTask(task.id, result);
    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
      this.completeTask(task.id, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check if a destination has any safety concerns
   */
  private async checkDestinationSafety(task: Task): Promise<TaskResult> {
    const { destination } = task.context;
    
    if (!destination) {
      return {
        success: false,
        error: 'Destination is required'
      };
    }
    
    const safetyInfo = checkDestinationSafety(destination);
    
    return {
      success: true,
      data: safetyInfo
    };
  }

  /**
   * Get all high-risk destinations
   */
  private async getHighRiskDestinations(task: Task): Promise<TaskResult> {
    const destinations = getHighRiskDestinations();
    
    return {
      success: true,
      data: { destinations }
    };
  }

  /**
   * Check if a country has sanctions
   */
  private async checkSanctions(task: Task): Promise<TaskResult> {
    const { country } = task.context;
    
    if (!country) {
      return {
        success: false,
        error: 'Country is required'
      };
    }
    
    const hasSanctionsResult = hasSanctions(country);
    
    return {
      success: true,
      data: { hasSanctions: hasSanctionsResult }
    };
  }

  /**
   * Suggest safer alternative destinations
   */
  private async suggestSafeAlternatives(task: Task): Promise<TaskResult> {
    const { destination, region } = task.context;
    
    if (!destination) {
      return {
        success: false,
        error: 'Destination is required'
      };
    }
    
    // This is a placeholder implementation that would be replaced with real logic
    // In a real implementation, you would use geographical data and safety data
    // to suggest truly appropriate alternatives
    
    // Simple mapping of regions to safer alternatives
    const safeAlternatives: Record<string, string[]> = {
      'eastern_europe': ['Poland', 'Hungary', 'Czech Republic', 'Slovakia'],
      'middle_east': ['Jordan', 'Oman', 'United Arab Emirates', 'Qatar'],
      'southeast_asia': ['Singapore', 'Malaysia', 'Thailand', 'Vietnam'],
      'africa': ['Morocco', 'Botswana', 'Ghana', 'Namibia'],
      'south_america': ['Uruguay', 'Chile', 'Costa Rica', 'Panama']
    };
    
    // Default to a mix of popular safe destinations if region not specified
    const alternatives = region && safeAlternatives[region] 
      ? safeAlternatives[region]
      : ['Portugal', 'Japan', 'New Zealand', 'Canada', 'Switzerland'];
    
    return {
      success: true,
      data: { alternatives }
    };
  }

  /**
   * Handle information requests from other agents
   */
  protected async handleInformationRequest(message: AgentMessage): Promise<void> {
    const { query } = message.content;
    
    try {
      let response: any;
      
      switch (query.type) {
        case 'is_destination_safe':
          const safetyInfo = checkDestinationSafety(query.destination);
          response = {
            isSafe: safetyInfo.safe,
            safetyInfo
          };
          break;
        case 'get_safety_details':
          const details = getSafetyInfo(query.destination);
          response = { details };
          break;
        default:
          response = { error: `Unknown query type: ${query.type}` };
      }
      
      // Send response back to the requesting agent
      this.sendMessage(
        message.fromAgentId,
        'information_response',
        { response, originalQuery: query },
        message.taskId
      );
    } catch (error) {
      console.error('Error handling information request:', error);
      this.sendMessage(
        message.fromAgentId,
        'information_response',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          originalQuery: query 
        },
        message.taskId
      );
    }
  }
}