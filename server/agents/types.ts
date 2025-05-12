/**
 * Travel Buddy A2A (Agent-to-Agent) Framework - Type Definitions
 * 
 * This file contains the type definitions for the A2A framework components
 */

export enum AgentType {
  USER_INTERFACE = 'user_interface',
  FLIGHT_BOOKING = 'flight_booking',
  ACCOMMODATION = 'accommodation',
  ITINERARY_PLANNER = 'itinerary_planner',
  NOTIFICATION = 'notification',
  TRAVEL_SAFETY = 'travel_safety'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface AgentCapability {
  action: string;
  description: string;
  parameters: Record<string, any>;
  examples?: Record<string, any>[];
}

export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];
  status: 'active' | 'inactive';
}

export interface TaskContext {
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentType: AgentType;
  assignedAgentId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  context: TaskContext;
  parentTaskId?: string;
  result?: any;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  nextTasks?: Partial<Task>[];
}

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string | 'orchestrator';
  type: 'task_assignment' | 'task_update' | 'task_completed' | 'information_request' | 'information_response';
  content: any;
  timestamp: Date;
  taskId?: string;
}