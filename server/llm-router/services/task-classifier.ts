// Task classifier to determine the complexity of prompt
import { TaskComplexity } from '../models/types';

export class TaskClassifier {
  // Simple heuristics for task classification
  classifyTask(prompt: string): TaskComplexity {
    // Convert to lowercase for case-insensitive matching
    const promptLower = prompt.toLowerCase();
    
    // Check for travel planning specific keywords
    if (
      promptLower.includes('itinerary') || 
      promptLower.includes('plan my trip') ||
      promptLower.includes('travel plan') ||
      promptLower.includes('detailed plan')
    ) {
      return TaskComplexity.COMPLEX;
    }
    
    // Count tokens as a simple metric for complexity
    const tokenCount = prompt.split(/\s+/).length;
    
    // Check for indicators of complex tasks
    const hasComplexIndicators = 
      promptLower.includes('analyze') ||
      promptLower.includes('compare') ||
      promptLower.includes('evaluate') ||
      promptLower.includes('explain in detail') ||
      promptLower.includes('specific recommendations') ||
      promptLower.includes('comprehensive') ||
      promptLower.includes('create a guide') ||
      promptLower.includes('budget breakdown');
      
    if (hasComplexIndicators || tokenCount > 50) {
      return TaskComplexity.COMPLEX;
    }
    
    // Check for indicators of moderate tasks
    const hasModerateIndicators =
      promptLower.includes('list') ||
      promptLower.includes('summarize') ||
      promptLower.includes('review') ||
      promptLower.includes('describe') ||
      promptLower.includes('suggestions') ||
      promptLower.includes('recommendations');
      
    if (hasModerateIndicators || tokenCount > 20) {
      return TaskComplexity.MODERATE;
    }
    
    // Default to simple
    return TaskComplexity.SIMPLE;
  }
}