import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ImportantDirective } from './important.directive';
import { FullNamePipe } from './full-name.pipe';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ImportantDirective, FullNamePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Directives and Pipes Example';

  importantClasses = {
    one: true,
    two: true,
    three: true,
    four: true
  };

  active = true;

  now = new Date();

  weko = {
    firstName: 'Wekoslav',
    lastName: 'Stefanovski'
  }

  changeClasses() {
    if (this.importantClasses.three) {
      this.importantClasses = {
        one: true,
        two: true,
        three: false,
        four: true
      };
    } else {
      this.importantClasses = {
        one: true,
        two: true,
        three: true,
        four: true
      };
    }
  }

  changeActive() {
    this.active = !this.active;
  }

}