import { Component, HostListener, OnInit } from '@angular/core';
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
  isBusy = false;

  ngOnInit(): void {
  }


  fnDestinationId(data: any) {
    this.id = data;
    if (this.id != 0) {
      this.isBusy = true;
      this.searchService.getDestinationById(this.id).subscribe(
        data2 => {
          setTimeout(() => {

          this.isBusy = false;
        }, 100);;

          this.destination = data2.destination;
          this.activities = data2.activities;

        },
        err => {
          this.isBusy = false;
          console.log(err)
        }
      );
    }
    else {
      this.destination = null;
      this.activities = [];

    }
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    let element = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>)[0];
    if (window.pageYOffset > element.clientHeight) {
      element.classList.add("header2")

    }
    else {
      element.classList.remove("header2")
    }
  }

}
