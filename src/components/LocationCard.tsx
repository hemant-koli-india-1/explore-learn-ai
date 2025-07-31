import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, Lock, Play } from "lucide-react";

interface LocationCardProps {
  id: string;
  title: string;
  description: string;
  managerName: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrentLocation: boolean;
  onNavigate?: () => void;
  onEnter?: () => void;
}

const LocationCard = ({ 
  title, 
  description, 
  managerName, 
  isUnlocked, 
  isCompleted, 
  isCurrentLocation,
  onNavigate,
  onEnter 
}: LocationCardProps) => {
  const getStatusIcon = () => {
    if (isCompleted) return <Check className="w-4 h-4" />;
    if (isUnlocked) return <Play className="w-4 h-4" />;
    return <Lock className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (isCompleted) return 'success';
    if (isUnlocked) return 'primary';
    return 'secondary';
  };

  return (
    <div className={`bg-card rounded-xl p-6 shadow-card transition-all duration-200 ${
      isCurrentLocation ? 'ring-2 ring-primary/50 bg-primary/5' : ''
    } ${isUnlocked && !isCompleted ? 'hover:shadow-elevated' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isCompleted 
              ? 'bg-success/10 text-success' 
              : isUnlocked 
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
          }`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Manager: {managerName}</p>
          </div>
        </div>
        <Badge variant="secondary" className={`${
          isCompleted 
            ? 'bg-success/10 text-success border-success/20' 
            : isUnlocked 
              ? 'bg-primary/10 text-primary border-primary/20'
              : ''
        }`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}</span>
          </div>
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex space-x-2">
        {isUnlocked && !isCompleted && (
          <>
            <Button variant="outline" size="sm" onClick={onNavigate} className="flex-1">
              Navigate
            </Button>
            <Button variant="hero" size="sm" onClick={onEnter} className="flex-1">
              Enter Location
            </Button>
          </>
        )}
        {isCompleted && (
          <Button variant="outline" size="sm" onClick={onEnter} className="w-full">
            Review Content
          </Button>
        )}
        {!isUnlocked && (
          <Button variant="ghost" size="sm" disabled className="w-full">
            Complete Previous Location
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationCard;