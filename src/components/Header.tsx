import { useState } from "preact/hooks";
import { FilterMenu } from "./FilterMenu";
import type { EventCategory } from "../config/categories";

interface HeaderProps {
  loading: boolean;
  // Filter props to pass through to FilterMenu
  categoryFilters: Record<EventCategory, boolean>;
  onToggleCategory: (categoryId: EventCategory) => void;
  showNHLRink: boolean;
  onToggleNHLRink: (checked: boolean) => void;
  showOlympicRink: boolean;
  onToggleOlympicRink: (checked: boolean) => void;
  showUnpublished: boolean;
  onToggleUnpublished: (checked: boolean) => void;
  filteredCount: number;
  totalCount: number;
}

export function Header({
  loading,
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
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between py-2 px-5 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <h1 className="m-0 text-xl font-semibold text-gray-900 dark:text-white">
          OIC Calendar
        </h1>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-[13px] text-gray-600 dark:text-gray-400">Loading...</span>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-transparent border-none text-xl cursor-pointer p-1 flex items-center justify-center w-8 h-8 text-gray-900 dark:text-white"
            aria-label="Toggle filters menu"
          >
            ☰
          </button>
        </div>
      </header>

      <FilterMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categoryFilters={categoryFilters}
        onToggleCategory={onToggleCategory}
        showNHLRink={showNHLRink}
        onToggleNHLRink={onToggleNHLRink}
        showOlympicRink={showOlympicRink}
        onToggleOlympicRink={onToggleOlympicRink}
        showUnpublished={showUnpublished}
        onToggleUnpublished={onToggleUnpublished}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
    </>
  );
}
