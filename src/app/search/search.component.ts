import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CountriesService } from "../services/countries.service";
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

  @Output() listDestination: EventEmitter<any[]> =
    new EventEmitter<any[]>();

  @Output() DestinationId: EventEmitter<number> =
    new EventEmitter<number>();


  constructor(private countriesService: CountriesService,
    private searchService: SearchService,
  ) { }

  countryInfo: any[] = [];
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

  ngOnInit(): void {
    this.getCountries()

    this.getDefaultdestination();
  }

  getCountries() {

    this.isBusy = true;
    this.countriesService.allCountries().subscribe(
      data2 => {

        setTimeout(() => {
          this.isBusy = false;
        }, 800);;


        this.countryInfo = data2.Countries;
        this.countryInfo.forEach((elementc: any) => {
          this.autocompleteItems.push({ name: elementc.CountryName, type: 'country', parent: null });
          elementc.States.forEach((elementCity: any) => {
            this.autocompleteItems.push({ name: elementCity.StateName, type: 'city', parent: elementc.CountryName });
          });
        });

      },
      err => console.log(err)
    );
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
        }, 800);;

        this.destinations = data2.destinations;
        if (this.destinations.length != 0) {
          this.numberLoop = Math.ceil(this.destinations.length / 3);
        }
      },
      err => console.log(err)
    );
  }
  onSearch() {

    this.showTable = true;
    this.DestinationId.emit(0);

    if (this.inputItem == null || this.inputItem == '')
      this.getDefaultdestination()
    else {
      if (this.inputItemObj == undefined || this.inputItemObj == null) {
        this.inputItemObj = ({ name: this.inputItem, type: "city_or_country", parent: null })
      }


      this.isBusy = true;
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
            }, 1000);;

          }
          else {
            this.destinations = data2.destinations;
            this.numberLoop = Math.ceil(this.destinations.length / 3);
            this.inputItemObj = null
          }
        },
        err => console.log(err)
      );

    }


  }
  getData(number: number) {
    if (this.destinations.length == 0) {
      return [];
    }
    else {
      return this.destinations.slice(number, number + 3);
    }
  }
  onClickTrending(data: any) {
    this.DestinationId.emit(data.id);
    this.showTable = false;

  }
}
export class TagModel {
  display: string | undefined;
  value: string | undefined;
}