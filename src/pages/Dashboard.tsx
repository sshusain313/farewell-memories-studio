
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Eye, Share, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface GroupInfo {
  groupId: string;
  groupName: string;
  year: string;
  totalMembers: number;
  gridVotes: { hexagonal: number; square: number; circle: number };
  members: Array<{
    id: string;
    name: string;
    photo: string;
    vote: string;
  }>;
  isLeader: boolean;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    const savedGroupInfo = localStorage.getItem('groupInfo');
    if (savedGroupInfo) {
      try {
        const parsed = JSON.parse(savedGroupInfo);
        setGroupInfo(parsed);
      } catch (error) {
        console.error('Error parsing group info:', error);
      }
    }
  }, []);

  const getWinningTemplate = (votes: { hexagonal: number; square: number; circle: number }) => {
    return Object.entries(votes).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
  };

  const handleShare = () => {
    if (groupInfo) {
      const shareLink = `${window.location.origin}/join/${groupInfo.groupId}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!user?.isLeader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">This page is only accessible to group leaders.</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Group Found</h1>
            <p className="text-gray-600 mb-6">You haven't created a group yet.</p>
            <Link to="/create-group">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = Math.round((groupInfo.members.length / groupInfo.totalMembers) * 100);
  const winningTemplate = getWinningTemplate(groupInfo.gridVotes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{groupInfo.groupName}</h1>
              <p className="text-gray-600">Class of {groupInfo.year} • {winningTemplate} grid</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link to="/editor">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Eye className="h-4 w-4 mr-2" />
                View Editor
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Group Progress</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {groupInfo.members.length} of {groupInfo.totalMembers} members have joined
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Member List */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Members ({groupInfo.members.length}/{groupInfo.totalMembers})</CardTitle>
            </CardHeader>
            <CardContent>
              {groupInfo.members.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No members yet</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleShare}>
                    Invite Members
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {groupInfo.members.map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className="relative">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                        />
                        <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">Voted: {member.vote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voting Results */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Template Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['square', 'hexagonal', 'circle'] as const).map((template) => (
                  <div key={template} className="flex items-center justify-between">
                    <span className="capitalize text-gray-700">{template}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            template === winningTemplate 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                              : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: groupInfo.members.length > 0 
                              ? `${(groupInfo.gridVotes[template] / groupInfo.members.length) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {groupInfo.gridVotes[template]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
