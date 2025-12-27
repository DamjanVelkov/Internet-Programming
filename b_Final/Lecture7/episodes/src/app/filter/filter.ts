import { Component, EventEmitter, Output } from '@angular/core';

export type FilterCriteria = {
  era?: "Recent" | "Modern" | "Classic";
  yearFrom?: number;
  yearTo?: number;
}

@Component({
  selector: 'app-filter',
  imports: [],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {

  @Output() 
  filterChanged = new EventEmitter<FilterCriteria>();

  onFilterChange(era: "Recent" | "Modern" | "Classic" | "All") {
    if (era === "All") {
      const criteria: FilterCriteria = {};
      this.filterChanged.emit(criteria);
      return;
    }
    const criteria: FilterCriteria = { era };
    this.filterChanged.emit(criteria);
  }

}