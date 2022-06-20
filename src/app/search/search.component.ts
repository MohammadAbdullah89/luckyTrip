import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { SearchService } from "../services/search.service";

import { Observable, Subject } from 'rxjs';
declare var require: any
const swal = require('sweetalert2');
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Input() showTable = true;

  DestinationId: number = 0;

  constructor(private searchService: SearchService,
  ) { }

  autocompleteItems: any[] = [];
  clients: any[] = [];

  items_relation: TagModel[] | undefined;
  flag: boolean = true;
  ClientName: any = null;


  inputItem = '';
  inputItemObj: any;
  // enable or disable visiblility of dropdown
  listHidden = true;
  showError = false;
  selectedIndex = -1;
  filteredList: any[] = [];
  destinations: any[] = [];
  numberLoop: number = 0;
  isBusy = false;

  destination: any = null;
  activities: any[] = [];

  filterDestinations: any[] = [];

  ngOnInit(): void {
    // this.getCountries()

    this.getDefaultdestination();
    let localId = localStorage.getItem('id');
    if (localId != null && localId != '0') {
      this.onClickTrending(localId);
      localStorage.removeItem('id');
    }
  }

  // modifies the filtered list as per input
  getFilteredList() {
    this.listHidden = false;
    if (!this.listHidden && this.inputItem !== undefined && this.inputItem !== '') {
      this.filteredList = this.autocompleteItems.filter((item) => item.name.toLowerCase().startsWith(this.inputItem.toLowerCase())).slice(0, 8);
    }
  }

  // select highlighted item when enter is pressed or any item that is clicked
  selectItem(ind: number) {

    if (ind < 0)
      return;

    if (this.filteredList[ind] == undefined)
      return;

    this.inputItemObj = this.filteredList[ind]
    this.inputItem = this.filteredList[ind].name;
    if (this.filteredList[ind].parent != null)
      this.inputItem = this.filteredList[ind].name + ' - ' + this.filteredList[ind].parent;

    this.listHidden = true;
    this.selectedIndex = ind;
  }

  // navigate through the list of items
  onKeyPress(event: { key: string; }) {

    if (!this.listHidden) {
      if (event.key === 'Escape') {
        this.selectedIndex = -1;
        this.toggleListDisplay(0);
      }

      if (event.key === 'Enter') {

        this.toggleListDisplay(0);
      }
      if (event.key === 'ArrowDown') {

        this.listHidden = false;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredList.length;
        if (this.filteredList.length > 0 && !this.listHidden) {
          document.getElementsByTagName('list-item')[this.selectedIndex].scrollIntoView();
        }
      } else if (event.key === 'ArrowUp') {

        this.listHidden = false;
        if (this.selectedIndex <= 0) {
          this.selectedIndex = this.filteredList.length;
        }
        this.selectedIndex = (this.selectedIndex - 1) % this.filteredList.length;

        if (this.filteredList.length > 0 && !this.listHidden) {

          document.getElementsByTagName('list-item')[this.selectedIndex].scrollIntoView();
        }
      }
    }
  }

  // show or hide the dropdown list when input is focused or moves out of focus
  toggleListDisplay(sender: number) {

    if (sender === 1) {
      // this.selectedIndex = -1;
      this.listHidden = false;
      this.getFilteredList();
    } else {
      // helps to select item by clicking
      setTimeout(() => {
        this.selectItem(this.selectedIndex);
        this.listHidden = true;
        if (!this.autocompleteItems.includes(this.inputItem)) {
          this.showError = true;
          this.filteredList = this.autocompleteItems.slice(0, 8)
        } else {
          this.showError = false;
        }
      }, 500);
    }
  }


  getDefaultdestination() {

    this.isBusy = true;

    this.searchService.search('none', 'none').subscribe(
      data2 => {

        setTimeout(() => {
          this.isBusy = false;
        }, 800);

        this.destinations = data2.destinations;
        this.filterDestinations = this.destinations.slice(0, 6);

        if (this.destinations.length != 0) {
          this.numberLoop = Math.ceil(this.destinations.length / 3);
          this.autocompleteItems = [];
          this.destinations.forEach((element: any) => {
            if (this.autocompleteItems.find(x => x.name.toLowerCase() == element.country_name.toLowerCase()) == null)
              this.autocompleteItems.push({ id: element.id, name: element.country_name, type: 'country', parent: null, image_url: element.image_url });

            if (this.autocompleteItems.find(x => x.name.toLowerCase() == element.city.toLowerCase()) == null)
              this.autocompleteItems.push({ id: element.id, name: element.city, type: 'city', parent: element.country_name, image_url: element.image_url });
          });
          this.searchService.destinationStoreg = this.autocompleteItems;
        }
      },
      err => {
        this.isBusy = false;
        console.log(err)
      }
    );
  }


  onClickTrending(data: any) {
    // this.DestinationId.emit(data.id);
    this.showTable = false;

    this.DestinationId = data;
    if (this.DestinationId != 0) {
      localStorage.removeItem('id');
      localStorage.setItem('id', this.DestinationId.toString());

      this.isBusy = true;
      this.searchService.getDestinationById(this.DestinationId).subscribe(
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
      localStorage.removeItem('id');
      this.destination = null;
      this.activities = [];

    }

  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    let element = Array.from(document.getElementsByClassName('header') as HTMLCollectionOf<HTMLElement>)[0];
    if (element)
      if (window.pageYOffset > element.clientHeight) {
        element.classList.add("header2")

      }
      else {
        element.classList.remove("header2")
      }
  }
  onSearchWithoutServerRequist() {
    this.showTable = true;

    this.isBusy = true;
    this.destination = null;
    this.activities = [];
    if (this.destinations && this.destinations.length == 0) {
      this.filterDestinations = this.destinations.slice(0, 6);
    }
    else {
      if (this.inputItem == null || this.inputItem == '') {
        this.filterDestinations = this.destinations.slice(0, 6);
      }
      else {
        if (this.inputItemObj != null && this.inputItemObj != undefined) {
          if (this.inputItemObj.type == 'city') {
            this.filterDestinations = this.destinations.filter((x: { city: string | any; }) => x.city.includes(this.inputItemObj.name)).slice(0, 6)
          }
          else if (this.inputItemObj.type == 'country') {
            this.filterDestinations = this.destinations.filter((x: { country_name: string | any; }) => x.country_name.includes(this.inputItemObj.name)).slice(0, 6)
          }
          else {
            this.filterDestinations = this.destinations.filter((x: { city: string | any; country_name: string | any; }) => x.city.includes(this.inputItemObj.name) || x.country_name.includes(this.inputItemObj.name)).slice(0, 6)

          }
        }
        else {
          this.filterDestinations = this.destinations.filter((x: { city: string | any; country_name: string | any; }) => x.city.includes(this.inputItem) || x.country_name.includes(this.inputItem)).slice(0, 6)
        }
      }

    }
    this.isBusy = false;
    this.numberLoop = Math.ceil(this.destinations.length / 3);
    this.inputItemObj = null
    if (this.filterDestinations.length == 0) {
      setTimeout(() => {
        const Toast = swal.mixin({
          toast: true,
          position: 'top-right',
          iconColor: 'white',
          customClass: {
            popup: 'colored-toast'
          },
          showConfirmButton: false,
          timer: 2500,
        })
        Toast.fire({
          icon: 'error',
          title: "No results found for '" + this.inputItem + "'"
        })
      }, 1000);
    }
  }

  onSearch() {
    this.showTable = true;
    this.DestinationId = 0;

    if (this.inputItem == null || this.inputItem == '')
      this.getDefaultdestination()
    else {
      if (this.inputItemObj == undefined || this.inputItemObj == null) {
        this.inputItemObj = ({ name: this.inputItem, type: "city_or_country", parent: null })
      }


      this.isBusy = true;
      this.destination = null;
      this.activities = [];
      this.searchService.search(this.inputItemObj['type'], this.inputItemObj['name']).subscribe(
        async data2 => {
          setTimeout(() => {
            this.isBusy = false;
          }, 800);;

          if (data2.destinations.length == 0) {
            const Toast = swal.mixin({
              toast: true,
              position: 'top-right',
              iconColor: 'white',
              customClass: {
                popup: 'colored-toast'
              },
              showConfirmButton: false,
              timer: 2500,
            })
            setTimeout(() => {

              Toast.fire({
                icon: 'error',
                title: "No results found for '" + this.inputItem + "'"
              })
            }, 1000);

          }
          else {
            this.destinations = data2.destinations;
            this.filterDestinations = this.destinations;

            this.numberLoop = Math.ceil(this.destinations.length / 3);
            this.inputItemObj = null
          }
        },
        err => {
          this.isBusy = false;
          console.log(err)
        }
      );

    }



  }

}
export class TagModel {
  display: string | undefined;
  value: string | undefined;
}