// Initialize AI scheduler when the app starts
import { AIScheduler } from '@/lib/scheduler';

// For development, you can start the scheduler here
// In production, you might want more control over when it starts
if (process.env.NODE_ENV === 'development') {
  // Start scheduler after a short delay to ensure app is ready
  setTimeout(() => {
    AIScheduler.start();
  }, 5000);
}