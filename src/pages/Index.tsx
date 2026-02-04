import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, CalendarDays, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/utils/supabase";
import type { Event } from "@/types/event";

export default function Index() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: events = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .neq("status", "inactive")
        .order("date_time", { ascending: true });

      if (error) {
        throw error;
      }
      return (data as Event[]) || [];
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleGetTickets = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const filteredEvents = events?.filter((event) => {
    // Exclude inactive events
    if (event.status === "inactive") {
      return false;
    }

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = new Date(event.date_time);
    const matchesDateRange =
      (!startDate || eventDate >= startDate) &&
      (!endDate || eventDate <= endDate);

    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/50 to-background pt-24 pb-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <CalendarDays className="h-4 w-4" />
              Discover Sydney
            </div>
            <h1 className="mb-4 animate-fade-in">
              Find Your Next
              <br />
              <span className="text-accent">Sydney Experience</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground animate-fade-in">
              Discover concerts, festivals, exhibitions, and more happening across Sydney.
            </p>

            <div className="relative mx-auto max-w-md animate-slide-up">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 text-base shadow-card"
              />
            </div>

            {/* Date Range Filter */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 animate-slide-up">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {startDate ? format(startDate, "MMM d") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => endDate ? date > endDate : false}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {endDate ? format(endDate, "MMM d") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>

              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : isError ? (
            <div className="py-24 text-center">
              <CalendarDays className="mx-auto mb-4 h-12 w-12 text-red-500/50" />
              <h3 className="mb-2 text-lg font-medium">Unable to load events</h3>
              <p className="text-muted-foreground mb-4">
                {queryError instanceof Error ? queryError.message : "Please try again later"}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Upcoming Events
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({filteredEvents.length})
                  </span>
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <EventCard event={event} onGetTickets={handleGetTickets} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-24 text-center">
              <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Check back soon for upcoming events in Sydney"}
              </p>
            </div>
          )}
        </div>
      </section>

      <LeadCaptureModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
