import { Component, AfterViewInit, OnInit, OnDestroy, } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface SearchResult {
  content: string;
  url: string;
  title: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  keywords: string = '';
  searchResults: SearchResult[] = [];
  documentationJson: SearchResult[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Fetch the JSON data on component initialization
    this.fetchDocumentation();
  }

  ngAfterViewInit() 
  {

  }

  ngOnDestroy() {
  }

  fetchDocumentation(): void {
    this.http.get<SearchResult[]>('http://localhost:3000/documentation').subscribe(
      (response: SearchResult[]) => {
        this.documentationJson = response;
      },
      (error: any) => {
        console.log('Error fetching data:', error);
      }
    );
  }

  search(): void {
    console.log('Keywords:', this.keywords);
    console.log(this.documentationJson);

    if (!this.keywords.trim()) {
      this.searchResults = [];
      return;
    }

    // Reset the search results array
    this.searchResults = [];

    // Filter the array items based on the keyword
    this.searchResults = this.documentationJson.filter((item: SearchResult) =>
      item.title.toLowerCase().includes(this.keywords.toLowerCase())
    );

    //console.log('Search Results:', this.searchResults);
  }

  showIframe(result: any) {
    // Set the showIframe property of the clicked result to true
    /*result.showIframe = !result.showIframe;
    result.url = "https://antmedia.io/" + result.toString();
    */
   window.open("https://antmedia.io" + result);
  }
}
