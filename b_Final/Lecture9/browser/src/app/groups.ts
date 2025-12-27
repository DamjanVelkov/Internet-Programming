import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from './group.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Group[]>('assets/groups.json');
  }

  getById(id: number) {
    return this.getAll().pipe(
      map(xs => xs.find(x => x.id === id))
    );
  }
}
