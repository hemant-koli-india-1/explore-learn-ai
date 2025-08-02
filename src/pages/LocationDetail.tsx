import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import AIAssistant from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, User, MapPin, Book, CheckCircle2 } from "lucide-react";

const SAMPLE_CONTENT = [
  {
    id: "1",
    title: "Meet Your Manager",
    type: "manager-intro",
    content: {
      managerName: "Mr. Raj Kumar",
      position: "Electronics Department Manager",
      experience: "15 years in electronics and power systems",
      message: "Welcome to the Electronics Department! I'm excited to guide you through our power supply systems and safety protocols today.",
      image: "/api/placeholder/300/300"
    }
  },
  {
    id: "2", 
    title: "Power Supply Fundamentals",
    type: "knowledge",
    content: {
      text: "Power supply systems are the backbone of our electronics department. Understanding voltage, current, and power distribution is crucial for safe and efficient operations.",
      keyPoints: [
        "Always check voltage levels before connecting equipment",
        "Use proper grounding techniques to prevent electrical hazards",
        "Monitor power consumption to avoid circuit overloads",
        "Maintain clean and organized power distribution panels"
      ],
      image: "/api/placeholder/400/250"
    }
  },
  {
    id: "3",
    title: "Safety Protocols",
    type: "knowledge", 
    content: {
      text: "Safety is our top priority. These protocols must be followed at all times when working with electrical systems.",
      keyPoints: [
        "Lockout/Tagout (LOTO) procedures for equipment maintenance",
        "Personal Protective Equipment (PPE) requirements",
        "Emergency shutdown procedures",
        "Incident reporting protocols"
      ],
      image: "/api/placeholder/400/250"
    }
  },
  {
    id: "4",
    title: "Customer Service Excellence", 
    type: "knowledge",
    content: {
      text: "Providing exceptional customer service while maintaining technical accuracy is essential in our department.",
      keyPoints: [
        "Listen actively to customer concerns and requirements",
        "Explain technical concepts in simple terms",
        "Always verify compatibility before recommendations",
        "Follow up to ensure customer satisfaction"
      ],
      image: "/api/placeholder/400/250"
    }
  }
];

const LocationDetail = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayNumber = searchParams.get('day') || '1';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(false);

  const progress = ((currentStep + 1) / SAMPLE_CONTENT.length) * 100;
  const currentContent = SAMPLE_CONTENT[currentStep];
  const isLastStep = currentStep === SAMPLE_CONTENT.length - 1;

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

  const isStepCompleted = completedSteps.includes(currentContent.id);
  const allStepsCompleted = completedSteps.length === SAMPLE_CONTENT.length;

  return (
    <Layout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/day/${dayNumber}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Power Supply Systems</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Electronics Department • Building A, Floor 2</span>
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
            <span>Step {currentStep + 1} of {SAMPLE_CONTENT.length}</span>
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
              <Button variant="hero" onClick={() => navigate(`/day/${dayNumber}`)}>
                Exit Location
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant
          department="Electronics Department - Power Supply Systems"
          isMinimized={isAssistantMinimized}
          onToggleMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
        />
      </div>
    </Layout>
  );
};

export default LocationDetail;