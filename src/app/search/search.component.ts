import { Component, AfterViewInit, OnInit, OnDestroy, } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


interface SearchResult {
  content: string;
  url: string;
  title: string;
}

interface RSSFeed {
  rss: {
    channel: {
      item: {
        title: string[];
        link: string[];
        description: string[];
      }[];
    }[];
  };
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
  feedItems: any = {};

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}


  ngOnInit() {
    // Fetch the JSON data on component initialization
    this.fetchDocumentation();
    this.parseRssFeed();
  }

  ngAfterViewInit() 
  {

  }

  ngOnDestroy() {

  }

  fetchDocumentation(): void {
    this.http.get<SearchResult[]>('http://localhost:5080/docs.jsp').subscribe(
      (response: SearchResult[]) => {
        this.documentationJson = response;
      },
      (error: any) => {
        console.log('Error fetching data:', error);
      }
    );
  }

  log(text){
    console.log(text);
  }


  parseRssFeed() {
    const feedUrl = 'http://localhost:5080/blogs.jsp';

    this.http.get(feedUrl, { responseType: 'text' }).subscribe(
      (response: string) => {

        const responseData = response.trim().replace(/^\s+|\s+$/g, '');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseData, 'text/xml');
        this.feedItems = this.convertXmlToJson(xmlDoc);
      },
      (error: any) => {
        console.error('Error fetching XML feed:', error);
      }
    );
  }


  convertXmlToJson(xmlString) {

    const items = xmlString.getElementsByTagName("item");

    this.log(items);
  
    const jsonItems = [];
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const jsonItem = {};
  
      const childNodes = item.childNodes;
      for (let j = 0; j < childNodes.length; j++) {
        const childNode = childNodes[j];
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          jsonItem[childNode.nodeName] = childNode.textContent.trim();
        }
      }
  
      jsonItems.push(jsonItem);
    }
  
    return jsonItems;
  }

  
getObjectKeys(obj: any): string[] {
  return Object.keys(obj);
}

  search(): void {
    //console.log('Keywords:', this.keywords);
    //console.log(this.documentationJson);

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
