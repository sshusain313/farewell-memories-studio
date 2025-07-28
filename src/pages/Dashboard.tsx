
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Share, Eye, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface GroupInfo {
  groupId: string;
  groupName: string;
  year: string;
  totalMembers: number;
  gridVotes: {
    hexagonal: number;
    square: number;
    circle: number;
  };
  members: Array<{
    id: string;
    name: string;
    photo: string;
    vote: string;
  }>;
  isLeader: boolean;
}

const Dashboard = () => {
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedGroupInfo = localStorage.getItem('groupInfo');
    if (savedGroupInfo) {
      try {
        setGroupInfo(JSON.parse(savedGroupInfo));
      } catch (error) {
        console.error('Error parsing group info:', error);
      }
    }
  }, []);

  const getWinningTemplate = (votes: GroupInfo['gridVotes']) => {
    return Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  };

  const handleShare = () => {
    if (groupInfo) {
      const shareLink = `${window.location.origin}/join/${groupInfo.groupId}`;
      navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Group Found</h1>
            <p className="text-gray-600 mb-6">You need to create a group first.</p>
            <Link to="/create-group">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winningTemplate = getWinningTemplate(groupInfo.gridVotes);
  const completionPercentage = Math.round((groupInfo.members.length / groupInfo.totalMembers) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{groupInfo.groupName}</h1>
            <p className="text-gray-600">Class of {groupInfo.year} • Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{groupInfo.members.length}/{groupInfo.totalMembers}</p>
              <p className="text-sm text-gray-600">Members Joined</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{completionPercentage}%</div>
              <p className="text-sm text-gray-600">Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Badge variant="secondary" className="mb-2 capitalize">
                {winningTemplate}
              </Badge>
              <p className="text-sm text-gray-600">Winning Template</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(groupInfo.gridVotes).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Votes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Vote Counts */}
          <Card>
            <CardHeader>
              <CardTitle>Live Vote Counts</CardTitle>
              <CardDescription>Real-time voting results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupInfo.gridVotes).map(([template, count]) => (
                  <div key={template} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="capitalize font-medium">{template}</span>
                      {winningTemplate === template && (
                        <Badge variant="default" className="bg-green-600">Winner</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: groupInfo.members.length > 0 
                              ? `${(count / groupInfo.members.length) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Member Join Status */}
          <Card>
            <CardHeader>
              <CardTitle>Member Join Status</CardTitle>
              <CardDescription>{groupInfo.members.length} of {groupInfo.totalMembers} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {groupInfo.members.map((member, index) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-600">Voted: {member.vote}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  </div>
                ))}
                {groupInfo.members.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No members have joined yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleShare} className="w-full" variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share Group Link
              </Button>
              <Link to="/editor">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Eye className="h-4 w-4 mr-2" />
                  View Editor
                </Button>
              </Link>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Share this link with your group:</p>
                <code className="text-xs bg-white p-2 rounded block break-all">
                  {window.location.origin}/join/{groupInfo.groupId}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
