import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CourseProgress from "@/components/CourseProgress";
import DayCard from "@/components/DayCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Settings, Award, MapPin } from "lucide-react";

const COURSE_DATA = [
  {
    day: 1,
    title: "Electronics Department",
    description: "Learn about power supply systems, customer engagement, and warranty processes",
    locations: 3,
    status: 'available' as const
  },
  {
    day: 2,
    title: "Customer Service Hub", 
    description: "Master customer interaction protocols and complaint resolution procedures",
    locations: 4,
    status: 'available' as const
  },
  {
    day: 3,
    title: "Inventory Management",
    description: "Understand stock control, ordering systems, and warehouse operations",
    locations: 5,
    status: 'locked' as const
  },
  {
    day: 4,
    title: "Sales & Marketing",
    description: "Explore sales strategies, marketing campaigns, and customer analytics",
    locations: 4,
    status: 'locked' as const
  },
  {
    day: 5,
    title: "Quality Assurance",
    description: "Learn quality standards, testing procedures, and compliance requirements",
    locations: 3,
    status: 'locked' as const
  }
];

const Index = () => {
  const [currentDay] = useState(1);
  const navigate = useNavigate();

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
                <h2 className="font-semibold">John Doe</h2>
                <p className="text-white/80 text-sm">Employee ID: EMP001</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Award className="w-3 h-3 mr-1" />
              Trainee
            </Badge>
          </div>
        </Card>

        {/* Course Progress */}
        <CourseProgress currentDay={currentDay} />

        {/* Today's Focus */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Today's Focus</h3>
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">Electronics Department</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Today you'll explore the electronics department and learn about power systems, 
                  customer engagement protocols, and warranty procedures.
                </p>
                <Button variant="hero" size="sm" onClick={() => navigate('/day/1')}>
                  Start Day 1
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Overview */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">5-Day Course Overview</h3>
          <div className="grid gap-4">
            {COURSE_DATA.map((course) => (
              <DayCard
                key={course.day}
                day={course.day}
                title={course.title}
                description={course.description}
                status={course.status}
                locations={course.locations}
                onClick={() => {
                  if (course.status === 'available') {
                    navigate(`/day/${course.day}`);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">0/5</div>
            <div className="text-xs text-muted-foreground">Days Completed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">0/19</div>
            <div className="text-xs text-muted-foreground">Locations Visited</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">0%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
