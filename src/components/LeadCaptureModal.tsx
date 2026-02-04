import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/types/event";

const leadSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  emailOptIn: z.boolean().default(false),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadCaptureModal({ event, open, onOpenChange }: LeadCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: "",
      emailOptIn: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        email: data.email,
        event_id: event.id,
        email_opt_in: data.emailOptIn,
      });

      if (error) throw error;

      toast({
        title: "You're all set!",
        description: "Redirecting you to the ticket page...",
      });

      // Reset form and close modal
      form.reset();
      onOpenChange(false);

      // Redirect to original URL
      if (event.original_url) {
        window.open(event.original_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Get Tickets</DialogTitle>
          <DialogDescription className="text-base">
            {event?.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailOptIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal text-muted-foreground">
                      Keep me updated about similar events in Sydney
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Tickets
                  <ExternalLink className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
