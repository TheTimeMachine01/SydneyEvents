import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Loader2,
  Download,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollArea,
} from "@/components/ui/scroll-area";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Event, EventStatus } from "@/types/event";

const statusColors: Record<EventStatus, { badge: string; table: string }> = {
  new: {
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    table: "bg-blue-50 hover:bg-blue-50/80",
  },
  updated: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    table: "bg-amber-50 hover:bg-amber-50/80",
  },
  inactive: {
    badge: "bg-gray-100 text-gray-800 border-gray-200",
    table: "bg-gray-50/50 hover:bg-gray-50/70 opacity-60",
  },
  imported: {
    badge: "bg-green-100 text-green-800 border-green-200",
    table: "hover:bg-muted/50",
  },
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [importNotes, setImportNotes] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date_time", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  const importMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .update({
          status: "imported" as EventStatus,
          imported_at: new Date().toISOString(),
          imported_by: user?.id,
          import_notes: importNotes || null,
        })
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setImportNotes("");
      setSelectedEvent(null);
      toast({
        title: "Event imported",
        description: "The event has been imported to the platform.",
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "There was an error importing the event.",
        variant: "destructive",
      });
    },
  });

  const handleRowClick = (event: Event) => {
    setSelectedEvent(event);
    setImportNotes("");
  };

  const handleImport = (event: Event) => {
    importMutation.mutate(event.id);
  };

  // Get unique cities for filter
  const cities = [...new Set(events?.map((e) => e.city) || [])];

  // Filter events
  const filteredEvents = events?.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesCity = cityFilter === "all" || event.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Event Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and import events to your platform
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="imported">Imported</SelectItem>
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px]">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all" || cityFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCityFilter("all");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Events Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden flex-1">
          <PanelGroup direction="horizontal">
            {/* Left Panel - Table */}
            <Panel minSize={30} defaultSize={60}>
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {filteredEvents?.map((event) => (
                  <TableRow
                    key={event.id}
                    className={`cursor-pointer transition-colors ${
                      statusColors[event.status].table
                    }`}
                    onClick={() => handleRowClick(event)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt=""
                              className={`h-full w-full object-cover ${
                                event.status === "inactive" ? "opacity-50" : ""
                              }`}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-medium truncate ${
                              event.status === "inactive"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {event.title}
                          </p>
                          {event.source_name && (
                            <p className="text-xs text-muted-foreground">
                              {event.source_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(event.date_time), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[150px]">
                      {event.venue}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[event.status].badge}
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              )}
            </Panel>

            {/* Resize Handle */}
            {selectedEvent && <PanelResizeHandle className="w-1 bg-border hover:bg-accent/50 transition-colors" />}

            {/* Right Panel - Preview */}
            {selectedEvent && (
              <Panel minSize={25} defaultSize={40}>
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <Badge
                        variant="outline"
                        className={`${statusColors[selectedEvent.status].badge} w-fit mb-2`}
                      >
                        {selectedEvent.status.charAt(0).toUpperCase() +
                          selectedEvent.status.slice(1)}
                      </Badge>
                      <h3 className="text-xl font-semibold leading-tight">
                        {selectedEvent.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(
                          new Date(selectedEvent.date_time),
                          "EEEE, MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>

                    {selectedEvent.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={selectedEvent.image_url}
                          alt={selectedEvent.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Venue</h4>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {selectedEvent.venue}, {selectedEvent.city}
                      </p>
                    </div>

                    {selectedEvent.description && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Description
                        </h4>
                        <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                      </div>
                    )}

                    {selectedEvent.source_name && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
                        <p>{selectedEvent.source_name}</p>
                      </div>
                    )}

                    {selectedEvent.last_scraped_at && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Last Scraped At
                        </h4>
                        <p className="text-sm">
                          {format(
                            new Date(selectedEvent.last_scraped_at),
                            "MMMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                        {selectedEvent.status === "updated" && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ This event was recently updated. Please review the changes.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedEvent.original_url && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Original URL
                        </h4>
                        <a
                          href={selectedEvent.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-1 text-sm break-all"
                        >
                          {selectedEvent.original_url}
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    {selectedEvent.imported_at && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Imported At
                        </h4>
                        <p className="text-sm">
                          {format(new Date(selectedEvent.imported_at), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}

                    {selectedEvent.status !== "imported" && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Import Notes
                        </h4>
                        <Textarea
                          placeholder="Add notes about this event before importing..."
                          value={importNotes}
                          onChange={(e) => setImportNotes(e.target.value)}
                          className="h-24 text-sm"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                      {selectedEvent.status !== "imported" && (
                        <Button
                          onClick={() => handleImport(selectedEvent)}
                          disabled={importMutation.isPending}
                          className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          {importMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Import to Platform
                        </Button>
                      )}
                      {selectedEvent.original_url && (
                        <Button variant="outline" asChild className="gap-2">
                          <a
                            href={selectedEvent.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Original
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </Panel>
            )}
          </PanelGroup>
        </div>
      </main>
    </div>
  );
}
