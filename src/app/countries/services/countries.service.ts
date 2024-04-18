import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, map, of, tap} from 'rxjs';
import { Country, Languages } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private apiUrl: string = 'https://restcountries.com/v3.1';

  public cacheStore: CacheStore = {
    byCapital: {term: '', countries: []},
    byCountries: {term: '', countries: []},
    byRegion: {region: '', countries: []}
  }

  constructor(private http: HttpClient) {
    this.loadFromLocalStorege();
  }

  private saveToLocalStorege() {
    localStorage.setItem('cacheStore', JSON.stringify(this.cacheStore));
  }

  private loadFromLocalStorege() {
    if(!localStorage.getItem('cacheStore')) return;

    this.cacheStore = JSON.parse(localStorage.getItem('cacheStore')!);
  }

  private getCountriesRequest(url:string): Observable<Country[]>{
    return this.http.get<Country[]>(url)
      .pipe(
        catchError(error => of([]) )
        // delay(2000)
      );
  }

  searchCountryByAlphaCode( code : string) : Observable<Country | null>{
    const url = `${this.apiUrl}/alpha/${code}`;

    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.length > 0 ? countries[0] : null ),
        catchError(error => of(null) )
      );
  }

  searchCapital( term : string) : Observable<Country[]>{
    const url = `${this.apiUrl}/capital/${term}`;
    return this.getCountriesRequest(url)
      .pipe(
        tap( countries => this.cacheStore.byCapital = {term, countries} ),
        tap( () => this.saveToLocalStorege())
      );
  }

  searchCountry( term : string) : Observable<Country[]>{
    const url = `${this.apiUrl}/name/${term}`;
    return this.getCountriesRequest(url)
      .pipe(
        tap( countries => this.cacheStore.byCountries = {term, countries} ),
        tap( () => this.saveToLocalStorege())
      );
  }

  searchRegion( region : Region) : Observable<Country[]>{
    const url = `${this.apiUrl}/region/${region}`;
    return this.getCountriesRequest(url)
    .pipe(
      tap( countries => this.cacheStore.byRegion = {region, countries} ),
      tap( () => this.saveToLocalStorege())
    );
  }




}

