// localStorage utility service for data persistence

export interface LocalStorageData {
  groups: Record<string, any>;
  users: Record<string, any>;
  authToken?: string;
  userData?: any;
}

export class LocalStorageService {
  private static readonly STORAGE_KEYS = {
    GROUPS: 'collage_groups',
    USERS: 'auth_users',
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
  };

  // Groups management
  static saveGroups(groups: Record<string, any>): void {
    try {
      // Optimize data before saving
      const optimizedGroups = this.optimizeGroupsData(groups);
      const dataString = JSON.stringify(optimizedGroups);
      
      // Check if data is too large
      if (dataString.length > 5000000) { // 5MB limit
        console.warn('Groups data is too large, clearing old data...');
        this.clearOldGroups();
        // Try again with cleaned data
        const cleanedGroups = this.optimizeGroupsData(groups);
        localStorage.setItem(this.STORAGE_KEYS.GROUPS, JSON.stringify(cleanedGroups));
      } else {
        localStorage.setItem(this.STORAGE_KEYS.GROUPS, dataString);
      }
    } catch (error) {
      console.error('Error saving groups to localStorage:', error);
      // If still failing, try to clear and save minimal data
      try {
        this.clearOldGroups();
        const minimalGroups = this.optimizeGroupsData(groups);
        localStorage.setItem(this.STORAGE_KEYS.GROUPS, JSON.stringify(minimalGroups));
      } catch (retryError) {
        console.error('Failed to save groups even after cleanup:', retryError);
      }
    }
  }

  private static optimizeGroupsData(groups: Record<string, any>): Record<string, any> {
    const optimized: Record<string, any> = {};
    
    Object.keys(groups).forEach(groupId => {
      const group = groups[groupId];
      optimized[groupId] = {
        ...group,
        // Compress member photos to reduce size
        members: group.members?.map((member: any) => ({
          ...member,
          photo: this.compressPhotoData(member.photo)
        })) || []
      };
    });
    
    return optimized;
  }

  private static compressPhotoData(photoData: string): string {
    // If photo data is too large, compress it
    if (photoData && photoData.length > 100000) { // 100KB limit
      // For now, just truncate very large photos
      return photoData.substring(0, 50000); // Limit to 50KB
    }
    return photoData;
  }

  private static clearOldGroups(): void {
    try {
      const savedGroups = localStorage.getItem(this.STORAGE_KEYS.GROUPS);
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Keep only groups created in the last 24 hours
        const recentGroups: Record<string, any> = {};
        Object.keys(groups).forEach(groupId => {
          const group = groups[groupId];
          if (new Date(group.createdAt) > oneDayAgo) {
            recentGroups[groupId] = group;
          }
        });
        
        localStorage.setItem(this.STORAGE_KEYS.GROUPS, JSON.stringify(recentGroups));
      }
    } catch (error) {
      console.error('Error clearing old groups:', error);
      // If all else fails, clear everything
      localStorage.removeItem(this.STORAGE_KEYS.GROUPS);
    }
  }

  static loadGroups(): Record<string, any> {
    try {
      const savedGroups = localStorage.getItem(this.STORAGE_KEYS.GROUPS);
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        // Convert date strings back to Date objects
        Object.keys(groups).forEach(groupId => {
          const group = groups[groupId];
          group.createdAt = new Date(group.createdAt);
          group.members.forEach((member: any) => {
            member.joinedAt = new Date(member.joinedAt);
          });
        });
        return groups;
      }
    } catch (error) {
      console.error('Error loading groups from localStorage:', error);
    }
    return {};
  }

  // Users management
  static saveUsers(users: Record<string, any>): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  static loadUsers(): Record<string, any> {
    try {
      const savedUsers = localStorage.getItem(this.STORAGE_KEYS.USERS);
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        // Convert date strings back to Date objects
        Object.keys(users).forEach(userId => {
          const user = users[userId];
          user.createdAt = new Date(user.createdAt);
        });
        return users;
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
    return {};
  }

  // Auth management
  static saveAuthToken(token: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token to localStorage:', error);
    }
  }

  static loadAuthToken(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error loading auth token from localStorage:', error);
      return null;
    }
  }

  static saveUserData(userData: any): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  static loadUserData(): any {
    try {
      const savedUserData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        // Convert date string back to Date object
        if (userData.createdAt) {
          userData.createdAt = new Date(userData.createdAt);
        }
        return userData;
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    }
    return null;
  }

  // Clear all data
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.GROUPS);
      localStorage.removeItem(this.STORAGE_KEYS.USERS);
      localStorage.removeItem(this.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Clear groups data specifically
  static clearGroups(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.GROUPS);
      console.log('Groups data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing groups from localStorage:', error);
    }
  }

  // Get localStorage usage info
  static getStorageUsage(): { used: number; total: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = localStorage.getItem(key);
        used += (key.length + (value ? value.length : 0)) * 2; // UTF-16 encoding
      }
      
      return { used, total: 5242880 }; // 5MB typical limit
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, total: 5242880 };
    }
  }

  // Export all data
  static exportData(): LocalStorageData {
    return {
      groups: this.loadGroups(),
      users: this.loadUsers(),
      authToken: this.loadAuthToken() || undefined,
      userData: this.loadUserData(),
    };
  }

  // Import data
  static importData(data: LocalStorageData): void {
    if (data.groups) {
      this.saveGroups(data.groups);
    }
    if (data.users) {
      this.saveUsers(data.users);
    }
    if (data.authToken) {
      this.saveAuthToken(data.authToken);
    }
    if (data.userData) {
      this.saveUserData(data.userData);
    }
  }
} 