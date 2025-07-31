import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface CourseProgressProps {
  currentDay: number;
  totalDays?: number;
  dayProgress?: number;
}

const CourseProgress = ({ currentDay, totalDays = 5, dayProgress = 0 }: CourseProgressProps) => {
  const overallProgress = ((currentDay - 1) / totalDays) * 100 + (dayProgress / totalDays);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Course Progress</h3>
        <span className="text-sm text-muted-foreground">
          Day {currentDay} of {totalDays}
        </span>
      </div>
      
      <Progress value={overallProgress} className="mb-4" />
      
      <div className="flex justify-between items-center">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isCompleted = dayNum < currentDay;
          const isCurrent = dayNum === currentDay;
          
          return (
            <div key={dayNum} className="flex flex-col items-center">
              <div className={`mb-2 ${
                isCompleted 
                  ? 'text-success' 
                  : isCurrent 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              <span className={`text-xs ${
                isCompleted || isCurrent 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              }`}>
                Day {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseProgress;