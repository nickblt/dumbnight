import { CATEGORIES, type EventCategory } from "../config/categories";

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // Category filters
  categoryFilters: Record<EventCategory, boolean>;
  onToggleCategory: (categoryId: EventCategory) => void;
  // Rink filters
  showNHLRink: boolean;
  onToggleNHLRink: (checked: boolean) => void;
  showOlympicRink: boolean;
  onToggleOlympicRink: (checked: boolean) => void;
  // Additional filters
  showUnpublished: boolean;
  onToggleUnpublished: (checked: boolean) => void;
  // Event counts
  filteredCount: number;
  totalCount: number;
}

export function FilterMenu({
  isOpen,
  onClose,
  categoryFilters,
  onToggleCategory,
  showNHLRink,
  onToggleNHLRink,
  showOlympicRink,
  onToggleOlympicRink,
  showUnpublished,
  onToggleUnpublished,
  filteredCount,
  totalCount,
}: FilterMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[999]"
      />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[min(300px,80vw)] bg-white dark:bg-gray-900 shadow-[-2px_0_8px_rgba(0,0,0,0.15)] z-[1000] py-2 px-5 overflow-y-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="m-0 text-xl text-gray-900 dark:text-white">
              Filters
            </h2>
            <button
              onClick={onClose}
              className="bg-transparent border-none text-xl cursor-pointer p-1 flex items-center justify-center text-gray-600 dark:text-gray-400 w-8 h-8"
              aria-label="Close filters menu"
            >
              ✕
            </button>
          </div>

          <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            ({filteredCount} of {totalCount} events)
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <h3 className="mt-0 mb-3 text-base text-gray-900 dark:text-white">
            Categories
          </h3>
          <div className="flex flex-col gap-3">
            {CATEGORIES.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100"
              >
                <input
                  type="checkbox"
                  checked={categoryFilters[category.id]}
                  onChange={() => onToggleCategory(category.id)}
                />
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rink Filters */}
        <div className="mb-6">
          <h3 className="mt-0 mb-3 text-base text-gray-900 dark:text-white">
            Rinks
          </h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={showNHLRink}
                onChange={(e) =>
                  onToggleNHLRink((e.target as HTMLInputElement).checked)
                }
              />
              <span>NHL Rink</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={showOlympicRink}
                onChange={(e) =>
                  onToggleOlympicRink((e.target as HTMLInputElement).checked)
                }
              />
              <span>Olympic Rink</span>
            </label>
          </div>
        </div>

        {/* Additional Filters */}
        <div>
          <h3 className="mt-0 mb-3 text-base text-gray-900 dark:text-white">
            Additional
          </h3>
          <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
            <input
              type="checkbox"
              checked={showUnpublished}
              onChange={(e) =>
                onToggleUnpublished((e.target as HTMLInputElement).checked)
              }
            />
            <span>Show Unpublished</span>
          </label>
        </div>
      </div>
    </>
  );
}
