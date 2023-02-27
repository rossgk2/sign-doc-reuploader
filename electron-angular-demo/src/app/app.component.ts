import {Component} from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {  
  apiResponse = '';
  pokemonName = '';
  
  async onClick() {
    console.log("onClick() called.");
    const requestConfig = {
      method: "get",
      url: `https://pokeapi.co/api/v2/pokemon/${this.pokemonName}`
    };

    /* preloader.js specifies that request2 should send requestConfig to the channel in the 
       main process named request1. In main.js it's specified that whenever the channel
       named request1 is invoked, the function handleRequest should be called on the provided
       requestConfig.

       Loosely speaking we have request2 -> request1 -> handleRequest.
    */

    const response = await (<any>window).api.request2(requestConfig);
    this.apiResponse = JSON.stringify(response);
  }

  /* Helper function for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
