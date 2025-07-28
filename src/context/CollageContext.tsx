
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    
    // Store in localStorage as well
    localStorage.setItem(`group_${id}`, JSON.stringify(newGroup));
    
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

    // Update localStorage
    localStorage.setItem(`group_${groupId}`, JSON.stringify(updatedGroup));

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

    // Update localStorage
    localStorage.setItem(`group_${groupId}`, JSON.stringify(updatedGroup));
  };

  const getGroup = (groupId: string): Group | undefined => {
    // First check in-memory state
    if (groups[groupId]) {
      return groups[groupId];
    }

    // Then check localStorage
    const savedGroup = localStorage.getItem(`group_${groupId}`);
    if (savedGroup) {
      try {
        const group = JSON.parse(savedGroup);
        setGroups(prev => ({ ...prev, [groupId]: group }));
        return group;
      } catch (error) {
        console.error('Error parsing saved group:', error);
      }
    }

    return undefined;
  };

  return (
    <CollageContext.Provider value={{
      groups,
      createGroup,
      joinGroup,
      getGroup,
      updateGroupTemplate
    }}>
      {children}
    </CollageContext.Provider>
  );
};
