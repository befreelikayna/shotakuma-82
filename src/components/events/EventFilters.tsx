
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type EventFilterProps = {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const EventFilters = ({ 
  activeFilter, 
  setActiveFilter, 
  activeTab, 
  setActiveTab 
}: EventFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") {
      params.set("category", activeFilter);
    }
    params.set("tab", activeTab);
    setSearchParams(params);
  }, [activeFilter, activeTab, setSearchParams]);

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "upcoming"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "past"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Passés
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-10 overflow-x-auto">
        <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "all"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveFilter("anime")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "anime"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Anime
          </button>
          <button
            onClick={() => setActiveFilter("manga")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "manga"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Manga
          </button>
          <button
            onClick={() => setActiveFilter("cosplay")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "cosplay"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Cosplay
          </button>
          <button
            onClick={() => setActiveFilter("gaming")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "gaming"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Gaming
          </button>
          <button
            onClick={() => setActiveFilter("culture")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === "culture"
                ? "bg-festival-accent text-white shadow-accent"
                : "text-festival-secondary hover:bg-slate-100"
            }`}
          >
            Culture
          </button>
        </div>
      </div>
    </>
  );
};

export default EventFilters;
