import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, BookOpen, Trophy } from "lucide-react";

interface DayCardProps {
  day: number;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  locations: number;
  onClick?: () => void;
}

const DayCard = ({ day, title, description, status, locations, onClick }: DayCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'available': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'available': return 'Start Now';
      default: return 'Locked';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': return <Trophy className="w-5 h-5" />;
      case 'in-progress': return <BookOpen className="w-5 h-5" />;
      case 'available': return <MapPin className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-card rounded-xl p-6 shadow-card transition-all duration-200 ${
      status !== 'locked' ? 'hover:shadow-elevated cursor-pointer' : 'opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            status === 'completed' 
              ? 'bg-success/10 text-success' 
              : status === 'in-progress'
                ? 'bg-warning/10 text-warning'
                : status === 'available'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Day {day}</h3>
            <p className="text-sm text-muted-foreground">{locations} locations</p>
          </div>
        </div>
        <Badge variant="secondary" className={`${
          status === 'completed' 
            ? 'bg-success/10 text-success border-success/20' 
            : status === 'in-progress'
              ? 'bg-warning/10 text-warning border-warning/20'
              : status === 'available'
                ? 'bg-primary/10 text-primary border-primary/20'
                : ''
        }`}>
          {getStatusText()}
        </Badge>
      </div>
      
      <h4 className="font-medium text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      {status !== 'locked' && (
        <Button 
          variant={status === 'available' ? 'hero' : 'outline'}
          size="sm" 
          className="w-full"
          onClick={onClick}
        >
          {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}
        </Button>
      )}
    </div>
  );
};

export default DayCard;