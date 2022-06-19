import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchService {


    constructor(private http: HttpClient) { }

    search(type: string, value: string): Observable<any> {
        let params = new HttpParams();
        params.append("search_type", type)
        params.append("search_value", value)
        // let params = new HttpParams().set("search_type",'city').set("search_value", 'amman'); //Create new HttpParams
        let url: string = "https://devapi.luckytrip.co.uk/api/2.0/top_five/destinations?search_type=" + type + "&search_value=" + value + "";

        return this.http.get(url);
    }

    getDestinationById(id: number): Observable<any> {
        let url: string = "https://devapi.luckytrip.co.uk/api/2.0/top_five/destination?id=" + id + "";
        return this.http.get(url);
    }

}