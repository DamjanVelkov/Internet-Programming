import { Pipe, PipeTransform } from '@angular/core';
import { Person } from '../person';

@Pipe({
  name: 'fullName',
  standalone: true
})
export class FullNamePipe implements PipeTransform {
  transform(person: Person): string {
    if (!person) {
      return '';
    }
    return `${person.firstName} ${person.lastName}`;
  }
}