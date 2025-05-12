/**
 * Base Agent Class
 * 
 * This abstract class serves as the foundation for all agents in the system.
 * It provides common functionality and enforces a consistent interface.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AgentInfo, 
  AgentType, 
  AgentCapability, 
  Task, 
  TaskResult, 
  TaskStatus,
  AgentMessage
} from './types';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected type: AgentType;
  protected capabilities: AgentCapability[];
  protected status: 'active' | 'inactive';
  protected orchestrator: any; // Will be set by the orchestrator during registration

  constructor(name: string, type: AgentType) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.capabilities = [];
    this.status = 'inactive';
  }

  /**
   * Get agent info
   */
  public getInfo(): AgentInfo {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      capabilities: this.capabilities,
      status: this.status
    };
  }

  /**
   * Register a capability of this agent
   */
  protected registerCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }

  /**
   * Set the orchestrator reference
   */
  public setOrchestrator(orchestrator: any): void {
    this.orchestrator = orchestrator;
    this.status = 'active';
  }

  /**
   * Send a message to another agent or the orchestrator
   */
  protected sendMessage(toAgentId: string | 'orchestrator', type: AgentMessage['type'], content: any, taskId?: string): void {
    if (!this.orchestrator) {
      console.error(`Agent ${this.name} is not connected to an orchestrator`);
      return;
    }

    const message: AgentMessage = {
      id: uuidv4(),
      fromAgentId: this.id,
      toAgentId,
      type,
      content,
      timestamp: new Date(),
      taskId
    };

    this.orchestrator.routeMessage(message);
  }

  /**
   * Update a task's status
   */
  protected updateTaskStatus(taskId: string, status: TaskStatus, result?: any): void {
    this.sendMessage('orchestrator', 'task_update', { taskId, status, result }, taskId);
  }

  /**
   * Mark a task as completed
   */
  protected completeTask(taskId: string, result: TaskResult): void {
    this.sendMessage('orchestrator', 'task_completed', { taskId, result }, taskId);
  }

  /**
   * Request information from another agent
   */
  protected requestInformation(toAgentId: string, query: any, taskId?: string): void {
    this.sendMessage(toAgentId, 'information_request', { query }, taskId);
  }

  /**
   * Process a received message
   */
  public receiveMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task_assignment':
        this.handleTaskAssignment(message.content.task);
        break;
      case 'information_request':
        this.handleInformationRequest(message);
        break;
      default:
        console.log(`Agent ${this.name} received message of type ${message.type}`);
    }
  }

  /**
   * Handle a task assignment
   */
  protected abstract handleTaskAssignment(task: Task): Promise<void>;

  /**
   * Handle an information request from another agent
   */
  protected abstract handleInformationRequest(message: AgentMessage): Promise<void>;
}