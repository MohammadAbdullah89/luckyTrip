import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  @Input() listActivities: any[] = [];
  @Input() destination: any = null;


  numberLoop: number = 0;
  isBusy = false;
  constructor() { }

  ngOnInit(): void {
    this.isBusy = true;

    if (this.listActivities.length != 0) {
      this.numberLoop = Math.ceil(this.listActivities.length / 3);
    }
  }

  getData(number: number) {
    if (this.listActivities.length == 0) {
      return [];
    }
    else {
      return this.listActivities.slice(number, number + 3);
    }
  }

  ngAfterViewInit(){
    this.isBusy = false;
 
  }
  ngAfterContentInit() {
  
  
  }

}
