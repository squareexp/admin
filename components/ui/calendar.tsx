"use client";

import * as React from "react";
import { Calendar as HeroCalendar } from "@heroui/react";

import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof HeroCalendar> & {
  buttonVariant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
  showOutsideDays?: boolean;
};

function Calendar({ className, showOutsideDays, buttonVariant, ...props }: CalendarProps) {
  void showOutsideDays;
  void buttonVariant;

  return (
    <HeroCalendar className={cn("bg-background p-3", className)} {...props}>
      <HeroCalendar.Header>
        <HeroCalendar.NavButton slot="previous" />
        <HeroCalendar.Heading />
        <HeroCalendar.NavButton slot="next" />
      </HeroCalendar.Header>
      <HeroCalendar.Grid>
        <HeroCalendar.GridHeader>
          {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
        </HeroCalendar.GridHeader>
        <HeroCalendar.GridBody>
          {(date) => <HeroCalendar.Cell date={date} />}
        </HeroCalendar.GridBody>
      </HeroCalendar.Grid>
    </HeroCalendar>
  );
}

const CalendarDayButton = HeroCalendar.Cell;

export { Calendar, CalendarDayButton };
