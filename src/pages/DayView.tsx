import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import LocationCard from "@/components/LocationCard";
import AIAssistant from "@/components/AIAssistant";
import QuizComponent from "@/components/QuizComponent";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Clock, CheckCircle2 } from "lucide-react";

interface LocationData {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  manager_name?: string;
}

const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What is the primary safety protocol when working with power supply systems?",
    options: [
      "Always work alone for better concentration",
      "Turn off all power sources and use lockout/tagout procedures",
      "Wear only safety glasses",
      "Work during peak hours for better visibility"
    ],
    correctAnswer: 1
  },
  {
    id: "q2", 
    question: "Which document is required when processing a warranty claim?",
    options: [
      "Only the receipt",
      "Only the warranty card",
      "Receipt, warranty card, and product serial number",
      "Customer ID only"
    ],
    correctAnswer: 2
  }
];

const DayView = () => {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<'locations' | 'quiz' | 'completed'>('locations');
  const [completedLocations, setCompletedLocations] = useState<string[]>([]);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(true);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  const dayNumber = parseInt(dayId || '1');
  const dayData = {
    1: { title: "Electronics Department", description: "Learn about power supply systems" },
    2: { title: "Customer Service Hub", description: "Master customer interaction protocols" }
  }[dayNumber] || { title: "Day " + dayNumber, description: "Course content" };

  useEffect(() => {
    fetchLocations();
  }, [dayNumber]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          location_id,
          name,
          description,
          location,
          latitude,
          longitude,
          order_index
        `)
        .eq('course_id', dayNumber)
        .order('order_index');

      if (error) throw error;

      const formattedLocations: LocationData[] = (data || []).map(loc => ({
        id: loc.location_id.toString(),
        name: loc.name,
        description: loc.description || '',
        location: loc.location,
        latitude: loc.latitude ? parseFloat(loc.latitude.toString()) : null,
        longitude: loc.longitude ? parseFloat(loc.longitude.toString()) : null,
        manager_name: "Manager" // We'll fetch this from managers table later
      }));

      setLocations(formattedLocations);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMapsNavigation = (latitude: number | null, longitude: number | null, locationName: string) => {
    if (!latitude || !longitude) {
      toast({
        title: "Navigation Unavailable",
        description: "Location coordinates not available",
        variant: "destructive",
      });
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    
    // Open in new tab for desktop, direct navigation for mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = googleMapsUrl;
    } else {
      window.open(googleMapsUrl, '_blank');
    }

    toast({
      title: "Navigation Started",
      description: `Opening directions to ${locationName}`,
    });
  };

  const totalLocations = locations.length;
  const progress = (completedLocations.length / totalLocations) * 100;

  const handleLocationComplete = (locationId: string) => {
    if (!completedLocations.includes(locationId)) {
      setCompletedLocations(prev => [...prev, locationId]);
    }
  };

  const handleQuizComplete = (score: number, answers: Record<string, number>) => {
    setQuizScore(score);
    setCurrentPhase('completed');
    console.log('Quiz completed with score:', score, 'answers:', answers);
  };

  const isAllLocationsCompleted = completedLocations.length === totalLocations;

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Day {dayNumber}: {dayData.title}</h1>
            <p className="text-sm text-muted-foreground">3 locations to explore</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress value={progress} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedLocations.length} of {totalLocations} locations</span>
            <span>
              {currentPhase === 'completed' ? 'Day Completed!' 
               : currentPhase === 'quiz' ? 'Taking Quiz' 
               : 'Exploring Locations'}
            </span>
          </div>
        </div>

        {/* Phase Content */}
        {currentPhase === 'locations' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {isAllLocationsCompleted ? 'All Locations Completed!' : 'Current Focus'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isAllLocationsCompleted 
                      ? 'Ready to take the end-of-day quiz'
                      : 'Visit each location and complete the learning modules'
                    }
                  </p>
                </div>
              </div>
              {isAllLocationsCompleted && (
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setCurrentPhase('quiz')}
                >
                  Start End-of-Day Quiz
                </Button>
              )}
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Locations to Visit</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading locations...</p>
                </div>
              ) : (
                locations.map((location, index) => {
                  const isUnlocked = index === 0 || completedLocations.includes(locations[index - 1]?.id);
                  const isCompleted = completedLocations.includes(location.id);
                  
                  return (
                    <LocationCard
                      key={location.id}
                      id={location.id}
                      title={location.name}
                      description={location.description}
                      managerName={location.manager_name || "Manager"}
                      isUnlocked={isUnlocked}
                      isCompleted={isCompleted}
                      isCurrentLocation={false}
                      onNavigate={() => handleGoogleMapsNavigation(
                        location.latitude, 
                        location.longitude, 
                        location.name
                      )}
                      onEnter={() => {
                        if (isUnlocked) {
                          navigate(`/location/${location.id}?day=${dayNumber}`);
                        }
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {currentPhase === 'quiz' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold mb-2">End-of-Day Quiz</h2>
              <p className="text-muted-foreground">Test your knowledge from today's locations</p>
            </div>
            
            <QuizComponent
              questions={SAMPLE_QUIZ_QUESTIONS}
              onComplete={handleQuizComplete}
              timeLimit={10} // 10 minutes
            />
          </div>
        )}

        {currentPhase === 'completed' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Day 1 Complete!</h2>
              <p className="text-muted-foreground">
                Congratulations on completing the Electronics Department orientation
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-semibold mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalLocations}</div>
                  <div className="text-sm text-muted-foreground">Locations Visited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{quizScore}%</div>
                  <div className="text-sm text-muted-foreground">Quiz Score</div>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={() => navigate('/day/2')}>
              Continue to Day 2
            </Button>
          </div>
        )}

        {/* AI Assistant */}
        <AIAssistant
          department="Electronics Department"
          isMinimized={isAssistantMinimized}
          onToggleMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
        />
      </div>
    </Layout>
  );
};

export default DayView;