
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalStorageService } from '@/lib/localStorage';

export type GridTemplate = 'hexagonal' | 'square' | 'circle';

export interface Member {
  id: string;
  name: string;
  photo: string;
  vote: GridTemplate;
  joinedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  yearOfPassing: string;
  totalMembers: number;
  gridTemplate: GridTemplate;
  shareLink: string;
  createdAt: Date;
  members: Member[];
  votes: Record<GridTemplate, number>;
}

interface CollageContextType {
  groups: Record<string, Group>;
  createGroup: (groupData: Omit<Group, 'id' | 'shareLink' | 'createdAt' | 'members' | 'votes'>) => string;
  joinGroup: (groupId: string, memberData: Omit<Member, 'id' | 'joinedAt'>) => boolean;
  getGroup: (groupId: string) => Group | undefined;
  updateGroupTemplate: (groupId: string) => void;
  getAllGroups: () => Group[];
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  isLoading: boolean;
}

const CollageContext = createContext<CollageContextType | undefined>(undefined);

export const useCollage = () => {
  const context = useContext(CollageContext);
  if (!context) {
    throw new Error('useCollage must be used within a CollageProvider');
  }
  return context;
};

export const CollageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize groups from localStorage on mount
  useEffect(() => {
    try {
      const savedGroups = LocalStorageService.loadGroups();
      setGroups(savedGroups);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing CollageProvider:', error);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    if (isInitialized && !isLoading) {
      try {
        LocalStorageService.saveGroups(groups);
      } catch (error) {
        console.error('Error saving groups to localStorage:', error);
      }
    }
  }, [groups, isInitialized, isLoading]);

  const createGroup = (groupData: Omit<Group, 'id' | 'shareLink' | 'createdAt' | 'members' | 'votes'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const shareLink = `/join/${id}`;
    
    const newGroup: Group = {
      ...groupData,
      id,
      shareLink,
      createdAt: new Date(),
      members: [],
      votes: { hexagonal: 0, square: 0, circle: 0 }
    };

    setGroups(prev => ({ ...prev, [id]: newGroup }));
    
    return id;
  };

  const joinGroup = (groupId: string, memberData: Omit<Member, 'id' | 'joinedAt'>): boolean => {
    const group = groups[groupId];
    if (!group || group.members.length >= group.totalMembers) {
      return false;
    }

    const memberId = Math.random().toString(36).substr(2, 9);
    const newMember: Member = {
      ...memberData,
      id: memberId,
      joinedAt: new Date()
    };

    const updatedGroup = {
      ...group,
      members: [...group.members, newMember],
      votes: {
        ...group.votes,
        [memberData.vote]: group.votes[memberData.vote] + 1
      }
    };

    setGroups(prev => ({
      ...prev,
      [groupId]: updatedGroup
    }));

    return true;
  };

  const updateGroupTemplate = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;

    const winningTemplate = (Object.keys(group.votes) as GridTemplate[]).reduce((a, b) => 
      group.votes[a] > group.votes[b] ? a : b
    );

    const updatedGroup = {
      ...group,
      gridTemplate: winningTemplate
    };

    setGroups(prev => ({
      ...prev,
      [groupId]: updatedGroup
    }));
  };

  const getGroup = (groupId: string): Group | undefined => {
    return groups[groupId];
  };

  const getAllGroups = (): Group[] => {
    return Object.values(groups);
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => {
      const newGroups = { ...prev };
      delete newGroups[groupId];
      return newGroups;
    });
  };

  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    const group = groups[groupId];
    if (!group) return;

    const updatedGroup = {
      ...group,
      ...updates
    };

    setGroups(prev => ({
      ...prev,
      [groupId]: updatedGroup
    }));
  };

  return (
    <CollageContext.Provider value={{
      groups,
      createGroup,
      joinGroup,
      getGroup,
      updateGroupTemplate,
      getAllGroups,
      deleteGroup,
      updateGroup,
      isLoading
    }}>
      {children}
    </CollageContext.Provider>
  );
};
