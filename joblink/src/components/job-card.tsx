"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, DollarSign, Clock } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range: string;
  company?: {
    name: string;
  };
}

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, hasApplied }: Omit<JobCardProps, 'onApply'>) {
  return (
    <Card className="flex flex-col h-full glass-panel border-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative z-10">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-primary font-medium">
              <Building2 className="w-4 h-4" />
              {job.company?.name || "Company Name"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="capitalize">{job.type.replace("-", " ")}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-500 font-medium">
              <DollarSign className="w-4 h-4" />
              {job.salary_range}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button 
          type="submit"
          className="w-full" 
          disabled={hasApplied}
          variant={hasApplied ? "secondary" : "default"}
        >
          {hasApplied ? "Applied" : "Apply Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
