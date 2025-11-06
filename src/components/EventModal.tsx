import { format } from "date-fns";
import type { CalendarEvent } from "../types/api";
import { useEffect } from "preact/hooks";
import { getCategoryConfig } from "../config/categories";
import type { EventCategory } from "../config/categories";

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!event) return null;

  const formatTime = (date: Date) => format(date, "h:mm a");
  const formatDate = (date: Date) => format(date, "EEEE, MMMM d, yyyy");

  // Get registration URL based on category
  const getRegistrationUrl = () => {
    if (!event.category) return null;

    const categoryConfig = getCategoryConfig(event.category as EventCategory);

    // Only show registration if category allows it
    if (!categoryConfig.canRegister) return null;

    // If category has a sportsId, use the category-based registration URL
    if (categoryConfig.sportsId) {
      const dateStr = format(event.start, "yyyy-MM-dd");
      return `https://apps.daysmartrecreation.com/dash/x/#/online/sharks/event-registration?date=${dateStr}&facility_ids=3&sport_ids=${categoryConfig.sportsId}`;
    }

    // Otherwise, use team-based registration if homeTeamId exists
    if (event.homeTeamId) {
      return `https://apps.daysmartrecreation.com/dash/x/#/online/sharks/group/register/${event.homeTeamId}`;
    }

    return null;
  };

  const registrationUrl = getRegistrationUrl();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[9998] animate-in fade-in duration-200"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>{formatDate(event.start)}</div>
                <div>
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
                <div className="mt-1 text-gray-500 dark:text-gray-500">
                  {event.resourceName} Rink
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Show variant titles if deduplicated */}
            {event.variants.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  The following {event.variants.length} events are in this time
                  slot
                </h3>
                <ul className="space-y-2">
                  {event.variants.map((variant) => (
                    <li
                      key={variant.id}
                      className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-gray-300 dark:border-gray-600"
                    >
                      {variant.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <div
                  className="text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {/* Registration button */}
            {registrationUrl && (
              <div>
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
