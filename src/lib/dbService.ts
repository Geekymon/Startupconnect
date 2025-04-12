import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// A service that provides optimized database queries for the application
// This helps centralize database logic and improve performance

class DatabaseService {
  // Cache mechanism to reduce duplicate queries
  private cache: { [key: string]: { data: any, timestamp: number } } = {};
  private cacheTTL = 60000; // Cache time-to-live in milliseconds (1 minute)
  
  constructor() {}
  
  /**
   * Clear all cache or specific cache entry
   */
  clearCache(key?: string) {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }
  
  /**
   * Get active internship positions
   */
  async getActivePositions(forceFresh = false) {
    const cacheKey = 'active_positions';
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_active_positions');
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching active positions:', error);
      return null;
    }
  }
  
  /**
   * Get all startups
   */
  async getStartups(forceFresh = false) {
    const cacheKey = 'startups';
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_startups');
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching startups:', error);
      return null;
    }
  }
  
  /**
   * Get user profile
   */
  async getUserProfile(userId: string, type: 'startup' | 'student', forceFresh = false) {
    const cacheKey = `user_profile_${userId}_${type}`;
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      let data, error;
      
      if (type === 'startup') {
        const result = await supabase
          .from('startups')
          .select('*')
          .eq('owner_id', userId)
          .single();
          
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  /**
   * Get applications for a startup
   */
  async getStartupApplications(ownerId: string, forceFresh = false) {
    const cacheKey = `startup_applications_${ownerId}`;
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_startup_applications', {
        owner_id: ownerId
      });
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching startup applications:', error);
      return null;
    }
  }
  
  /**
   * Get positions for a startup
   */
  async getStartupPositions(startupId: string, forceFresh = false) {
    const cacheKey = `startup_positions_${startupId}`;
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('internship_positions')
        .select('*, applications(count)')
        .eq('startup_id', startupId);
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching startup positions:', error);
      return null;
    }
  }
  
  /**
   * Get student's applications
   */
  async getStudentApplications(studentId: string, forceFresh = false) {
    const cacheKey = `student_applications_${studentId}`;
    const now = Date.now();
    const cached = this.cache[cacheKey];
    
    if (!forceFresh && cached && (now - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          internship_positions (
            id,
            title,
            location,
            duration,
            stipend,
            startups (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      this.cache[cacheKey] = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return null;
    }
  }
  
  /**
   * Register a new startup (no caching needed)
   */
  async registerStartup(startupData: any) {
    try {
      const { data, error } = await supabase
        .from('startups')
        .insert(startupData)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering startup:', error);
      throw error;
    }
  }
  
  /**
   * Create a new position (no caching needed)
   */
  async createPosition(positionData: any) {
    try {
      const { data, error } = await supabase
        .from('internship_positions')
        .insert(positionData)
        .select();
      
      if (error) throw error;
      
      // Clear related caches to ensure fresh data
      this.clearCache('active_positions');
      this.clearCache(`startup_positions_${positionData.startup_id}`);
      
      return data;
    } catch (error) {
      console.error('Error creating position:', error);
      throw error;
    }
  }
  
  /**
   * Apply for a position (no caching needed)
   */
  async applyForPosition(positionId: string, studentId: string) {
    try {
      // Check if already applied
      const { data: existingApplications, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('position_id', positionId)
        .eq('student_id', studentId);
      
      if (checkError) throw checkError;
      
      if (existingApplications && existingApplications.length > 0) {
        throw new Error('You have already applied for this position');
      }
      
      // Create application
      const { data, error } = await supabase
        .from('applications')
        .insert({
          position_id: positionId,
          student_id: studentId,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      
      // Clear related caches
      this.clearCache(`student_applications_${studentId}`);
      return data;
    } catch (error) {
      console.error('Error applying for position:', error);
      throw error;
    }
  }
  
  /**
   * Update application status (no caching needed)
   */
  async updateApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected') {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select();
      
      if (error) throw error;
      
      // Clear all application caches
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith('startup_applications_') || key.startsWith('student_applications_')) {
          delete this.cache[key];
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
  
  /**
   * Update position status (no caching needed)
   */
  async updatePositionStatus(positionId: string, status: 'active' | 'closed') {
    try {
      const { data, error } = await supabase
        .from('internship_positions')
        .update({ status })
        .eq('id', positionId)
        .select();
      
      if (error) throw error;
      
      // Clear related caches
      this.clearCache('active_positions');
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith('startup_positions_')) {
          delete this.cache[key];
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating position status:', error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();
export default dbService;