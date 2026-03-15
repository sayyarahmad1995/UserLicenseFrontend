import { authService } from './auth.service';
import type { UserSession } from '@/types/api';

export const sessionService = {
  /**
   * Get all active sessions for the current user
   */
  async getActiveSessions(): Promise<UserSession[]> {
    const sessions = await authService.getSessions();
    // Ensure sessions are properly typed
    return (sessions || []).map((session: any) => ({
      id: session.id || '',
      userId: session.userId || 0,
      ipAddress: session.ipAddress || 'Unknown',
      userAgent: session.userAgent || 'Unknown',
      createdAt: session.createdAt || new Date().toISOString(),
      expiresAt: session.expiresAt || new Date().toISOString(),
      lastActivity: session.lastActivity || session.createdAt || new Date().toISOString(),
      isCurrent: session.isCurrent || false,
    }));
  },

  /**
   * Logout from all other sessions (keep current session active)
   */
  async logoutAllOtherSessions(): Promise<{ message: string }> {
    return authService.logoutAllOtherSessions();
  },

  /**
   * Logout from a specific session by ID
   */
  async logoutSession(sessionId: string): Promise<{ message: string }> {
    // Note: This might not be directly available from backend
    // For now, we'll provide a stub that clients can customize
    return { message: 'Logout from specific session not yet implemented' };
  },

  /**
   * Get session details including browser/device info
   */
  async getSessionDetails(): Promise<any> {
    const sessions = await this.getActiveSessions();
    return {
      totalSessions: sessions.length,
      sessions,
      currentSession: sessions.find((s) => s.isCurrent),
    };
  },

  /**
   * Parse user agent to get browser/device info
   */
  parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
  } {
    const browser = this.getBrowserInfo(userAgent);
    const os = this.getOSInfo(userAgent);
    const device = this.getDeviceInfo(userAgent);

    return { browser, os, device };
  },

  /**
   * Helper to extract browser info from user agent
   */
  getBrowserInfo(ua: string): string {
    if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown Browser';
  },

  /**
   * Helper to extract OS info from user agent
   */
  getOSInfo(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone')) return 'iOS';
    return 'Unknown OS';
  },

  /**
   * Helper to extract device info from user agent
   */
  getDeviceInfo(ua: string): string {
    if (ua.includes('Mobile') || ua.includes('Android')) return 'Mobile';
    if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
    return 'Desktop';
  },
};
