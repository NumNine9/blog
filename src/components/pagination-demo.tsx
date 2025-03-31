import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
  
  export function PaginationDemo() {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="border border-black rounded-none" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive className="border border-black rounded-none">
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="border border-black rounded-none">
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="border border-black rounded-none">
              3
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis className="border border-black rounded-none" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" className="border border-black rounded-none" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }
  
  