// src/services/api.js
// Central API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  /**
   * Create or update user profile and trigger matching
   */
  async createOrUpdateUser(payload) {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get all matches for a user
   */
  async getMatches(uid) {
    const response = await fetch(`${API_BASE_URL}/api/matches/${uid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Accept a match
   */
  async acceptMatch(matchId, uid) {
    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to accept match: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Create a video session for a match
   */
  async createSession(matchId, uid) {
    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Mark session as complete
   */
  async completeSession(sessionId, uid) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, completed: true })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to complete session: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Submit rating for a session
   */
  async submitRating(ratingRequestId, rater, stars, review) {
    const response = await fetch(`${API_BASE_URL}/api/ratings/${ratingRequestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rater, stars, review })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit rating: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return await response.json();
  }
}

export default new ApiService();