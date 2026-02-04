import { format } from "date-fns";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  onGetTickets: (event: Event) => void;
}

export function EventCard({ event, onGetTickets }: EventCardProps) {
  const formattedDate = format(new Date(event.date_time), "EEE, MMM d");
  const formattedTime = format(new Date(event.date_time), "h:mm a");

  return (
    <Card className="group overflow-hidden border-0 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <Calendar className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {event.source_name && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            {event.source_name}
          </span>
        )}
      </div>

      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-accent">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formattedDate}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formattedTime}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
          {event.title}
        </h3>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{event.venue}</span>
        </div>

        {event.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}

        <Button 
          onClick={() => onGetTickets(event)} 
          className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Get Tickets
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
