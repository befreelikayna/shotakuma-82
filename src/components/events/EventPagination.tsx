
import { ChevronLeft, ChevronRight } from "lucide-react";

type EventPaginationProps = {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  filteredEventsLength: number;
  eventsPerPage: number;
};

const EventPagination = ({ 
  currentPage, 
  totalPages, 
  paginate, 
  filteredEventsLength,
  eventsPerPage
}: EventPaginationProps) => {
  if (filteredEventsLength <= eventsPerPage) {
    return null;
  }

  return (
    <div className="mt-10 flex justify-center">
      <div className="inline-flex items-center gap-2">
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50"
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {Array.from({ length: totalPages }).map((_, index) => (
          <button 
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              currentPage === index + 1 
                ? "bg-festival-accent text-white" 
                : "border border-slate-200 text-festival-secondary hover:bg-slate-50"
            }`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50"
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EventPagination;
