import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState, useEffect } from "preact/hooks";
import { useEvents } from "../hooks/useEvents";
import { RINK_IDS } from "../constants";
import {
  CATEGORIES,
  type EventCategory,
  getCategoryConfig,
} from "../config/categories";
import type { CalendarEvent } from "../types/api";
import { Header } from "./Header";
import { EventModal } from "./EventModal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../react-big-calendar-dark.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Helper to parse URL params on initial load
function getInitialStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  // Parse date (format: YYYY-MM-DD)
  const dateParam = params.get("date");
  const initialDate = dateParam
    ? parse(dateParam, "yyyy-MM-dd", new Date())
    : new Date(); // Default: today's date

  // Parse view
  const viewParam = params.get("view") as View | null;
  const initialView: View =
    viewParam === "day" || viewParam === "week" ? viewParam : "day";

  // Parse rink filters
  const nhlParam = params.get("nhl");
  const olympicParam = params.get("olympic");
  const unpublishedParam = params.get("unpublished");

  const initialShowNHL = nhlParam !== null ? nhlParam === "true" : true;
  const initialShowOlympic =
    olympicParam !== null ? olympicParam === "true" : true;
  const initialShowUnpublished =
    unpublishedParam !== null ? unpublishedParam === "true" : false;

  // Parse category filters
  const initialCategoryFilters: Record<EventCategory, boolean> = {} as Record<
    EventCategory,
    boolean
  >;
  CATEGORIES.forEach((category) => {
    const categoryParam = params.get(category.id);
    initialCategoryFilters[category.id] =
      categoryParam !== null ? categoryParam === "true" : true;
  });

  return {
    date: initialDate,
    view: initialView,
    showNHL: initialShowNHL,
    showOlympic: initialShowOlympic,
    showUnpublished: initialShowUnpublished,
    categoryFilters: initialCategoryFilters,
  };
}

export function Calendar() {
  // Initialize state from URL params
  const initialState = getInitialStateFromURL();

  // Force day view on mobile (screen width < 768px)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveView = isMobile ? "day" : initialState.view;

  const [view, setView] = useState<View>(effectiveView);
  const [date, setDate] = useState(initialState.date);
  const [showNHLRink, setShowNHLRink] = useState(initialState.showNHL);
  const [showOlympicRink, setShowOlympicRink] = useState(
    initialState.showOlympic,
  );
  const [showUnpublished, setShowUnpublished] = useState(
    initialState.showUnpublished,
  );
  const [categoryFilters, setCategoryFilters] = useState<
    Record<EventCategory, boolean>
  >(initialState.categoryFilters);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  // Enforce day view on mobile if user tries to switch to week
  const handleViewChange = (newView: View) => {
    // Only handle views we support
    if (newView !== "day" && newView !== "week") return;

    if (
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      newView === "week"
    ) {
      setView("day");
    } else {
      setView(newView);
    }
  };

  const { events: allEvents, loading, error } = useEvents(date, view);

  // Update URL whenever state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add date (format: YYYY-MM-DD)
    params.set("date", format(date, "yyyy-MM-dd"));

    // Add view
    params.set("view", view);

    // Add rink filters (only if false, since true is default)
    if (!showNHLRink) params.set("nhl", "false");
    if (!showOlympicRink) params.set("olympic", "false");

    // Add unpublished filter (only if true, since false is default)
    if (showUnpublished) params.set("unpublished", "true");

    // Add category filters (only if false, since true is default)
    CATEGORIES.forEach((category) => {
      if (!categoryFilters[category.id]) {
        params.set(category.id, "false");
      }
    });

    // Update URL without triggering a page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;

    // Only update if the URL actually changed
    if (newUrl !== window.location.pathname + window.location.search) {
      if (isInitialLoad) {
        // Use replaceState on initial load to not clutter history
        window.history.replaceState(null, "", newUrl);
        setIsInitialLoad(false);
      } else {
        // Use pushState for subsequent changes to enable back button
        window.history.pushState(null, "", newUrl);
      }
    }
  }, [
    view,
    date,
    showNHLRink,
    showOlympicRink,
    showUnpublished,
    categoryFilters,
    isInitialLoad,
  ]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newState = getInitialStateFromURL();
      setView(newState.view);
      setDate(newState.date);
      setShowNHLRink(newState.showNHL);
      setShowOlympicRink(newState.showOlympic);
      setShowUnpublished(newState.showUnpublished);
      setCategoryFilters(newState.categoryFilters);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Filter events based on selected rinks, publish status, and categories
  const events = allEvents.filter((event) => {
    // Filter by rink
    if (event.resourceId === RINK_IDS.NHL && !showNHLRink) return false;
    if (event.resourceId === RINK_IDS.OLYMPIC && !showOlympicRink) return false;

    // Filter by publish status
    const isPublished = event.raw.attributes.publish;
    if (!isPublished && !showUnpublished) return false;

    // Filter by category
    if (event.category && !categoryFilters[event.category as EventCategory])
      return false;

    return true;
  });

  const toggleCategory = (categoryId: EventCategory) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Apply category colors to events
  const eventStyleGetter = (event: CalendarEvent) => {
    if (event.category) {
      const categoryConfig = getCategoryConfig(event.category as EventCategory);
      return {
        style: {
          backgroundColor: categoryConfig.color,
          borderColor: categoryConfig.color,
        },
      };
    }
    return {};
  };

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>OIC Calendar</h1>
        <p style={{ color: "red" }}>Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-gray-900">
      <Header
        loading={loading}
        categoryFilters={categoryFilters}
        onToggleCategory={toggleCategory}
        showNHLRink={showNHLRink}
        onToggleNHLRink={setShowNHLRink}
        showOlympicRink={showOlympicRink}
        onToggleOlympicRink={setShowOlympicRink}
        showUnpublished={showUnpublished}
        onToggleUnpublished={setShowUnpublished}
        filteredCount={events.length}
        totalCount={allEvents.length}
      />

      <div className="p-2 sm:p-4 md:p-5" style={{ height: "1000px" }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={setDate}
          defaultView="day"
          allDayMaxRows={0}
          showMultiDayTimes={true}
          views={["week", "day"]}
          step={15}
          timeslots={4}
          min={new Date(2025, 0, 1, 6, 0, 0)}
          max={new Date(2025, 0, 1, 23, 59, 59)}
          style={{ height: "100%", width: "100%" }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
          }}
        />
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
