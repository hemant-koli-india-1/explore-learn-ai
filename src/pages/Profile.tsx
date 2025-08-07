import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Calendar, Award, LogOut, Edit3 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          courses (
            title,
            description
          )
        `)
        .eq('employee_id', profile?.employee_id);

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      setProfileData(profile);
      setUserProgress(progress || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData || !user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {loading ? "Loading..." : profileData ? `${profileData.first_name} ${profileData.last_name}` : "User"}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  <Award className="w-3 h-3 mr-1" />
                  {loading ? "..." : profileData?.role || "Trainee"}
                </Badge>
                <Badge variant="outline">
                  Employee ID: {loading ? "..." : profileData?.employee_id || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData?.first_name || ""}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                disabled={!isEditing || loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData?.last_name || ""}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                disabled={!isEditing || loading}
              />
            </div>
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={profileData?.employee_id || ""}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                value={profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : ""}
                disabled
              />
            </div>
          </div>
          {isEditing && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {/* Course Progress Summary */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Training Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : `${userProgress?.filter(p => p.status === 'completed').length || 0}/5`}
              </div>
              <div className="text-sm text-muted-foreground">Days Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {loading ? "..." : `${userProgress?.length || 0}`}
              </div>
              <div className="text-sm text-muted-foreground">Course Progress Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {loading ? "..." : `${Math.round(((userProgress?.filter(p => p.status === 'completed').length || 0) / 5) * 100)}%`}
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-foreground">Completed Power Supply Systems</span>
              <span className="text-xs text-muted-foreground ml-auto">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm text-foreground">Started Electronics Department</span>
              <span className="text-xs text-muted-foreground ml-auto">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm text-foreground">Profile created</span>
              <span className="text-xs text-muted-foreground ml-auto">Yesterday</span>
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;