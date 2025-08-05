
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Users, Share, Eye, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCollage, Member } from '@/context/CollageContext';
import { MemberDetailsModal } from '@/components/MemberDetailsModal';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { getGroup, getAllGroups, isLoading, groups } = useCollage();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [group, setGroup] = useState<any>(null);

  // Update group data whenever user's groupId or groups change
  useEffect(() => {
    console.log('Dashboard useEffect - user.groupId:', user?.groupId);
    console.log('Dashboard useEffect - groups:', groups);
    
    if (user?.groupId) {
      const userGroup = getGroup(user.groupId);
      console.log('Dashboard useEffect - userGroup:', userGroup);
      if (userGroup) {
        setGroup(userGroup);
      } else {
        console.log('No group found for groupId:', user.groupId);
      }
    }
  }, [user?.groupId, getGroup, groups]); // Add groups as a dependency to re-run when any group updates
  
  // Show loading state while context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600">Initializing application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getWinningTemplate = (votes: { hexagonal: number; square: number; circle: number }) => {
    return Object.entries(votes).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
  };

  const handleShare = () => {
    if (group) {
      const shareLink = `${window.location.origin}/join/${group.id}`;
      navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  if (!group) {
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

  const winningTemplate = getWinningTemplate(group.votes);
  const completionPercentage = Math.round((group.members.length / group.totalMembers) * 100);
  const totalVotes = Object.values(group.votes as { hexagonal: number; square: number; circle: number }).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">Class of {group.yearOfPassing} • Dashboard</p>
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
        {/* <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{group.members.length}/{group.totalMembers}</p>
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
                {totalVotes}
              </p>
              <p className="text-sm text-gray-600">Total Votes</p>
            </CardContent>
          </Card>
        </div> */}
         <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6 text-center">
              <Users className="h-10 w-10 mx-auto text-blue-600 mb-3" />
              <p className="text-3xl font-bold text-blue-800">{group.members.length}</p>
              <p className="text-sm text-blue-700 mb-2">of {group.totalMembers} members</p>
              <Progress value={completionPercentage} className="w-full h-2" />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-10 w-10 mx-auto text-green-600 mb-3" />
              <p className="text-3xl font-bold text-green-800">{completionPercentage}%</p>
              <p className="text-sm text-green-700">Complete</p>
              <p className="text-xs text-green-600 mt-1">
                {group.totalMembers - group.members.length} spots left
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <Award className="h-10 w-10 mx-auto text-purple-600 mb-3" />
              <Badge variant="secondary" className="mb-2 capitalize text-purple-800 bg-purple-200">
                {winningTemplate}
              </Badge>
              <p className="text-sm text-purple-700">Winning Template</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-800">{totalVotes}</p>
              <p className="text-sm text-orange-700">Total Votes</p>
              <p className="text-xs text-orange-600 mt-1">
                {group.members.length > 0 ? `${Math.round((totalVotes / group.members.length) * 100)}% participation` : 'No votes yet'}
              </p>
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
                {Object.entries(group.votes).map(([template, count]) => (
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
                            width: group.members.length > 0 
                              ? `${((count as number) / group.members.length) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count as number}</span>
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
              <CardDescription>{group.members.length} of {group.totalMembers} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {group.members.map((member: Member, index: number) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-600">Voted: {member.vote}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  </div>
                ))}
                {group.members.length === 0 && (
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
                  {window.location.origin}/join/{group.id}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;