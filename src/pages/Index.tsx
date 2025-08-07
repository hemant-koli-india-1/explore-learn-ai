import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from '@supabase/supabase-js';
import Layout from "@/components/Layout";
import CourseProgress from "@/components/CourseProgress";
import DayCard from "@/components/DayCard";
import Chatbot from "@/components/Chatbot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Award, MapPin } from "lucide-react";

interface Course {
  course_id: number;
  title: string;
  description: string;
  total_locations: number;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  employee_id: number;
  role: string;
}

interface UserProgress {
  course_id: number;
  status: string;
}

const supabase = createClient(
  "https://yfyuwmpvhokdiyqcjgyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeXV3bXB2aG9rZGl5cWNqZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQzOTksImV4cCI6MjA2OTUxMDM5OX0.QPTGnNr3bswCO-kT_fFQPZkQcO4OvP-llsZ5apztAI8"
);

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(1);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDynamicData();
      checkAdminStatus();
    }
  }, [user]);

  const fetchDynamicData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch courses from database
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('course_id');

      if (coursesError) throw coursesError;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('employee_id', profile?.employee_id);

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      setCourseData(courses || []);
      setProfileData(profile);
      setUserProgress(progress || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    if (!user?.id) return;
    
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (roles && Array.isArray(roles)) {
        const hasAdminRole = roles.some((role: any) => role.role === 'admin');
        setIsAdmin(Boolean(hasAdminRole));
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const completedCourses = userProgress.filter(p => p.status === 'completed').length;
  const totalCourses = courseData.length;
  const totalLocations = courseData.reduce((acc, course) => acc + course.total_locations, 0);
  const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
            <p className="text-muted-foreground">Continue your onboarding journey</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
                Admin Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <Card className="p-6 bg-gradient-hero text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {profileData ? `${profileData.first_name} ${profileData.last_name}` : 'User'}
                </h2>
                <p className="text-white/80 text-sm">
                  Employee ID: {profileData?.employee_id || 'N/A'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Award className="w-3 h-3 mr-1" />
              {profileData?.role || 'Trainee'}
            </Badge>
          </div>
        </Card>

        {/* Course Progress */}
        <CourseProgress currentDay={currentDay} />

        {/* Today's Focus */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Today's Focus</h3>
          {loading ? (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="animate-pulse">Loading today's focus...</div>
            </Card>
          ) : courseData.length > 0 ? (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">{courseData[currentDay - 1]?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {courseData[currentDay - 1]?.description}
                  </p>
                  <Button variant="hero" size="sm" onClick={() => navigate(`/day/${currentDay}`)}>
                    Start Day {currentDay}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </Card>
          )}
        </div>

        {/* Course Overview */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Course Overview</h3>
          {loading ? (
            <div className="grid gap-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg h-24"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {courseData.map((course, index) => {
                const dayNumber = index + 1;
                const isCompleted = userProgress.some(p => p.course_id === course.course_id && p.status === 'completed');
                const isAvailable = dayNumber === 1 || userProgress.some(p => p.course_id === course.course_id - 1 && p.status === 'completed');
                
                return (
                  <DayCard
                    key={course.course_id}
                    day={dayNumber}
                    title={course.title}
                    description={course.description}
                    status={isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'}
                    locations={course.total_locations}
                    onClick={() => {
                      if (isAvailable || isCompleted) {
                        navigate(`/day/${dayNumber}`);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {loading ? "..." : `${completedCourses}/${totalCourses}`}
            </div>
            <div className="text-xs text-muted-foreground">Days Completed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {loading ? "..." : `${userProgress.length}/${totalLocations}`}
            </div>
            <div className="text-xs text-muted-foreground">Locations Visited</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {loading ? "..." : `${overallProgress}%`}
            </div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </Card>
        </div>

        {/* Chatbot */}
        {isChatbotOpen && (
          <Chatbot
            isMinimized={isChatbotMinimized}
            onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
            onClose={() => setIsChatbotOpen(false)}
          />
        )}

        {/* Chatbot Toggle */}
        {!isChatbotOpen && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => {
                setIsChatbotOpen(true);
                setIsChatbotMinimized(false);
              }}
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              💬
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;