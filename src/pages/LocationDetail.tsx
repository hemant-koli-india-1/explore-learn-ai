import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import AIAssistant from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, User, MapPin, Book, CheckCircle2 } from "lucide-react";

interface LocationContent {
  id: string;
  title: string;
  type: 'manager-intro' | 'knowledge';
  content: any;
}

const LocationDetail = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const dayNumber = searchParams.get('day') || '1';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [contentSteps, setContentSteps] = useState<LocationContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, [locationId]);

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('location_id', parseInt(locationId || '1'))
        .single();

      if (error) throw error;

      setLocationData(data);

      // For now, create sample content structure
      // In a full implementation, this would come from a separate content table
      const sampleContent: LocationContent[] = [
        {
          id: "1",
          title: "Meet Your Manager",
          type: "manager-intro",
          content: {
            managerName: "Mr. Raj Kumar",
            position: `${data.name} Manager`,
            experience: "15 years in electronics and power systems",
            message: `Welcome to ${data.name}! I'm excited to guide you through our operations and safety protocols today.`,
          }
        },
        {
          id: "2", 
          title: data.name,
          type: "knowledge",
          content: {
            text: data.description || "Learn about the key concepts and procedures for this location.",
            keyPoints: [
              "Always follow safety protocols when working in this area",
              "Use proper equipment and protective gear as required",
              "Report any incidents or concerns immediately",
              "Maintain clean and organized work areas"
            ],
          }
        },
        {
          id: "3",
          title: "Safety Protocols",
          type: "knowledge", 
          content: {
            text: "Safety is our top priority. These protocols must be followed at all times.",
            keyPoints: [
              "Lockout/Tagout (LOTO) procedures for equipment maintenance",
              "Personal Protective Equipment (PPE) requirements",
              "Emergency shutdown procedures",
              "Incident reporting protocols"
            ],
          }
        }
      ];

      setContentSteps(sampleContent);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load location data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = contentSteps.length > 0 ? ((currentStep + 1) / contentSteps.length) * 100 : 0;
  const currentContent = contentSteps[currentStep];
  const isLastStep = currentStep === contentSteps.length - 1;

  const handleNext = () => {
    if (!completedSteps.includes(currentContent.id)) {
      setCompletedSteps(prev => [...prev, currentContent.id]);
    }
    
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepCompleted = completedSteps.includes(currentContent?.id || '');
  const allStepsCompleted = completedSteps.length === contentSteps.length;

  const handleCompleteLocation = async () => {
    try {
      // Record location visit
      const { error } = await supabase
        .from('user_location_visits')
        .insert([{
          location_id: parseInt(locationId || '1'),
          employee_id: 1, // This would be dynamic in a real app
          quiz_score: 100 // Default score for completing all steps
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location completed successfully!",
      });

      // Navigate to next location or back to day view
      navigate(`/location/${parseInt(locationId || '1') + 1}?day=${dayNumber}`);
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to complete location",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading location...</p>
        </div>
      </Layout>
    );
  }

  if (!currentContent) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No content available for this location.</p>
          <Button variant="outline" onClick={() => navigate(`/day/${dayNumber}`)}>
            Back to Day View
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/day/${dayNumber}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{locationData?.name || 'Location'}</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{locationData?.location || 'Unknown Location'}</span>
            </div>
          </div>
          <Badge variant="secondary" className={allStepsCompleted ? "bg-success/10 text-success border-success/20" : ""}>
            {allStepsCompleted ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </>
            ) : (
              <>
                <Book className="w-3 h-3 mr-1" />
                Learning
              </>
            )}
          </Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {contentSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Content */}
        <Card className="p-6">
          {currentContent.type === 'manager-intro' ? (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {currentContent.content.managerName}
                </h2>
                <p className="text-muted-foreground mb-2">{currentContent.content.position}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentContent.content.experience}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground italic">
                  "{currentContent.content.message}"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">{currentContent.title}</h2>
              
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <Book className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Content Image Placeholder</p>
                </div>
              </div>

              <p className="text-foreground leading-relaxed">
                {currentContent.content.text}
              </p>

              <div>
                <h3 className="font-medium text-foreground mb-3">Key Points:</h3>
                <ul className="space-y-2">
                  {currentContent.content.keyPoints?.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-foreground">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {!isStepCompleted && (
              <Button variant="success" onClick={handleNext}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            {!isLastStep && (
              <Button variant="hero" onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {isLastStep && allStepsCompleted && (
              <>
                <Button 
                  variant="success" 
                  onClick={handleCompleteLocation}
                  className="mr-2"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Location
                </Button>
                <Button variant="outline" onClick={() => navigate(`/day/${dayNumber}`)}>
                  Exit Location
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant
          department={`${locationData?.name || 'Location'} - ${locationData?.location || 'Training'}`}
          isMinimized={isAssistantMinimized}
          onToggleMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
        />
      </div>
    </Layout>
  );
};

export default LocationDetail;