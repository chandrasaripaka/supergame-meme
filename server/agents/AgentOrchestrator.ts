/**
 * Agent Orchestrator
 * 
 * Central component that manages agents, tasks, and facilitates communication.
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import { 
  AgentType, 
  Task, 
  TaskStatus, 
  TaskPriority,
  AgentMessage,
  AgentInfo,
  TaskContext
} from './types';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private agentsByType: Map<AgentType, BaseAgent[]>;
  private tasks: Map<string, Task>;

  constructor() {
    this.agents = new Map();
    this.agentsByType = new Map();
    this.tasks = new Map();
    
    // Initialize empty arrays for each agent type
    Object.values(AgentType).forEach(type => {
      this.agentsByType.set(type as AgentType, []);
    });
  }

  /**
   * Register an agent with the orchestrator
   */
  public registerAgent(agent: BaseAgent): void {
    const agentInfo = agent.getInfo();
    this.agents.set(agentInfo.id, agent);
    
    // Add to type index
    const typeAgents = this.agentsByType.get(agentInfo.type) || [];
    typeAgents.push(agent);
    this.agentsByType.set(agentInfo.type, typeAgents);
    
    // Set orchestrator reference in agent
    agent.setOrchestrator(this);
    
    console.log(`Agent registered: ${agentInfo.name} (${agentInfo.type})`);
  }

  /**
   * Get all registered agents
   */
  public getAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).map(agent => agent.getInfo());
  }

  /**
   * Get agents by type
   */
  public getAgentsByType(type: AgentType): AgentInfo[] {
    const agents = this.agentsByType.get(type) || [];
    return agents.map(agent => agent.getInfo());
  }

  /**
   * Create a new task
   */
  public createTask(
    title: string,
    description: string,
    agentType: AgentType,
    context: any = {},
    priority: TaskPriority = TaskPriority.MEDIUM,
    parentTaskId?: string
  ): Task {
    const taskId = uuidv4();
    const now = new Date();
    
    const task: Task = {
      id: taskId,
      title,
      description,
      agentType,
      status: TaskStatus.PENDING,
      priority,
      createdAt: now,
      updatedAt: now,
      context,
      parentTaskId
    };
    
    this.tasks.set(taskId, task);
    console.log(`Task created: ${title} (${taskId})`);
    
    // Attempt to assign the task
    this.assignTask(task);
    
    return task;
  }

  /**
   * Get task by ID
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Assign a task to an appropriate agent
   */
  private assignTask(task: Task): boolean {
    const availableAgents = this.agentsByType.get(task.agentType) || [];
    
    if (availableAgents.length === 0) {
      console.log(`No agents available for task type: ${task.agentType}`);
      return false;
    }
    
    // Simple round-robin assignment - in a real implementation, 
    // you would have more sophisticated assignment logic
    const agent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    const agentInfo = agent.getInfo();
    
    // Update task
    task.assignedAgentId = agentInfo.id;
    task.status = TaskStatus.IN_PROGRESS;
    task.updatedAt = new Date();
    this.tasks.set(task.id, task);
    
    // Send task to agent
    const message: AgentMessage = {
      id: uuidv4(),
      fromAgentId: 'orchestrator',
      toAgentId: agentInfo.id,
      type: 'task_assignment',
      content: { task },
      timestamp: new Date(),
      taskId: task.id
    };
    
    agent.receiveMessage(message);
    console.log(`Task ${task.id} assigned to agent ${agentInfo.name} (${agentInfo.id})`);
    return true;
  }

  /**
   * Update a task's status
   */
  public updateTaskStatus(taskId: string, status: TaskStatus, result?: any): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }
    
    task.status = status;
    task.updatedAt = new Date();
    
    if (status === TaskStatus.COMPLETED && result) {
      task.result = result;
      task.completedAt = new Date();
    }
    
    this.tasks.set(taskId, task);
    console.log(`Task ${taskId} updated: ${status}`);
    
    // Process next tasks if any were returned in the result
    if (result && result.nextTasks && Array.isArray(result.nextTasks)) {
      result.nextTasks.forEach((nextTask: Partial<Task>) => {
        this.createTask(
          nextTask.title || 'Follow-up task',
          nextTask.description || '',
          nextTask.agentType || task.agentType,
          nextTask.context || {},
          nextTask.priority || task.priority,
          task.id
        );
      });
    }
  }

  /**
   * Route a message between agents
   */
  public routeMessage(message: AgentMessage): void {
    if (message.toAgentId === 'orchestrator') {
      this.handleOrchestratorMessage(message);
      return;
    }
    
    const targetAgent = this.agents.get(message.toAgentId);
    if (!targetAgent) {
      console.error(`Target agent not found: ${message.toAgentId}`);
      return;
    }
    
    targetAgent.receiveMessage(message);
  }

  /**
   * Handle messages sent to the orchestrator
   */
  private handleOrchestratorMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task_update':
        const { taskId, status, result } = message.content;
        this.updateTaskStatus(taskId, status, result);
        break;
      case 'task_completed':
        this.updateTaskStatus(message.content.taskId, TaskStatus.COMPLETED, message.content.result);
        break;
      default:
        console.log(`Orchestrator received message of type ${message.type}`);
    }
  }
}