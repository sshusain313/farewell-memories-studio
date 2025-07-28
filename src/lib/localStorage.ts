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
      localStorage.setItem(this.STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving groups to localStorage:', error);
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