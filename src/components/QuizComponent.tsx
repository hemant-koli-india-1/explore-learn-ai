import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: Record<string, number>) => void;
  timeLimit?: number; // in minutes
}

const QuizComponent = ({ questions, onComplete, timeLimit }: QuizComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : undefined);
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNext = () => {
    if (selectedAnswer !== "") {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestion].id]: parseInt(selectedAnswer)
      }));

      if (isLastQuestion) {
        // Calculate score and show results
        const finalAnswers = {
          ...answers,
          [questions[currentQuestion].id]: parseInt(selectedAnswer)
        };
        const score = calculateScore(finalAnswers);
        setShowResults(true);
        onComplete(score, finalAnswers);
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer("");
      }
    }
  };

  const calculateScore = (finalAnswers: Record<string, number>) => {
    let correct = 0;
    questions.forEach(question => {
      if (finalAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const score = calculateScore(answers);
    const passed = score >= 70; // 70% pass rate

    return (
      <Card className="p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}>
          {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {passed ? 'Congratulations!' : 'Quiz Complete'}
        </h3>
        <p className="text-muted-foreground mb-4">
          You scored {score}% ({Object.keys(answers).length} of {questions.length} questions)
        </p>
        {passed ? (
          <p className="text-success">You have passed this quiz!</p>
        ) : (
          <p className="text-destructive">You need 70% to pass. Please review the material and try again.</p>
        )}
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quiz</h2>
        {timeRemaining && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
        
        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
          {currentQ.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button 
          variant="hero" 
          onClick={handleNext}
          disabled={selectedAnswer === ""}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
};

export default QuizComponent;