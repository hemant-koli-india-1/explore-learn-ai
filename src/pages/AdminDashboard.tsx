import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Clock, Users, BookOpen, Trophy } from "lucide-react";

interface UserProgress {
  profile_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  role: string;
  joined_at: string;
  progress: any[];
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/auth');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      navigate('/admin/auth');
    }
  };

  const fetchUsers = async () => {
    try {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id, role, created_at');

      if (profilesError) throw profilesError;

      // Then get user progress for each profile
      const formattedUsers: UserProgress[] = [];
      
      for (const profile of profilesData || []) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('course_id, status, started_at, completed_at, approval_status, approved_by, approved_at')
          .eq('employee_id', parseInt(profile.employee_id));

        formattedUsers.push({
          profile_id: profile.id,
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || 'User',
          employee_id: profile.employee_id,
          role: profile.role || 'trainee',
          joined_at: profile.created_at,
          progress: progressData || []
        });
      }

      setUsers(formattedUsers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (employeeId: string, courseId: number, action: 'approved' | 'rejected') => {
    setActionLoading(`${employeeId}-${courseId}-${action}`);

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          approval_status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('employee_id', parseInt(employeeId))
        .eq('course_id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User progress ${action} successfully`,
      });

      fetchUsers(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} user progress`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getProgressSummary = (progress: any[]) => {
    const completed = progress.filter(p => p.status === 'completed').length;
    const total = Math.max(progress.length, 5); // Assuming 5 total courses
    return `${completed}/${total}`;
  };

  const getApprovalStatus = (progress: any[]) => {
    const pending = progress.filter(p => p.approval_status === 'pending').length;
    const approved = progress.filter(p => p.approval_status === 'approved').length;
    const rejected = progress.filter(p => p.approval_status === 'rejected').length;

    if (pending > 0) return { status: 'pending', count: pending };
    if (rejected > 0) return { status: 'rejected', count: rejected };
    if (approved > 0) return { status: 'approved', count: approved };
    return { status: 'none', count: 0 };
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage user progress and approvals</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to App
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-warning" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {users.filter(u => getApprovalStatus(u.progress).status === 'pending').length}
                </p>
                <p className="text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-success" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {users.filter(u => getApprovalStatus(u.progress).status === 'approved').length}
                </p>
                <p className="text-muted-foreground">Approved Users</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Progress Overview</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const approval = getApprovalStatus(user.progress);
                    const pendingCourse = user.progress.find(p => p.approval_status === 'pending');
                    
                    return (
                      <TableRow key={user.profile_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.employee_id}</TableCell>
                        <TableCell>{getProgressSummary(user.progress)}</TableCell>
                        <TableCell>
                          {approval.status === 'pending' && (
                            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                          {approval.status === 'approved' && (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {approval.status === 'rejected' && (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {approval.status === 'none' && (
                            <Badge variant="outline">No Progress</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {pendingCourse && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApproval(user.employee_id, pendingCourse.course_id, 'approved')}
                                disabled={actionLoading === `${user.employee_id}-${pendingCourse.course_id}-approved`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproval(user.employee_id, pendingCourse.course_id, 'rejected')}
                                disabled={actionLoading === `${user.employee_id}-${pendingCourse.course_id}-rejected`}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;