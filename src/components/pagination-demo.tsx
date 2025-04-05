import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PaginationDemo({ 
  currentPage, 
  totalPages,
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    // Always show first page
    pages.push(1);
    
    // Show ellipsis if current page is far from start
    if (currentPage > maxVisiblePages) {
      pages.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - maxVisiblePages + 1) {
      pages.push('...');
    }
    
    // Always show last page if different from first
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={`${currentPage}`} 
            className="border border-black rounded-none"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis className="border border-black rounded-none" />
            ) : (
              <PaginationLink 
                href={`${currentPage}`}
                className={`border border-black rounded-none ${currentPage === page ? 'bg-black text-white' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof page === 'number') onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href={`${currentPage}`} 
            className="border border-black rounded-none"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}