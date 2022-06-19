import { Component, OnInit } from '@angular/core';
import { SearchService } from "../services/search.service";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {

  constructor(
    private searchService: SearchService,

  ) { }
  destination: any = null;
  activities: any[] = [];

  id = 0;

  ngOnInit(): void {
  }

 
  fnDestinationId(data: any) {
    this.id = data;
    if (this.id != 0) {
      this.searchService.getDestinationById(this.id).subscribe(
        data2 => {
          this.destination = data2.destination;
          this.activities = data2.activities;

        },
        err => console.log(err)
      );
    }
    else {
      this.destination = null;
      this.activities = [];

    }
  }
}
