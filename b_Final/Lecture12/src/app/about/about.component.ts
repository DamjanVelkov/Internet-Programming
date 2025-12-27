import { Component } from '@angular/core';
import { StudentService } from '../services/student.service';
import { Observable } from 'rxjs';
import { Student } from '../models/student';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  student$: Observable<Student>;
  currentYear = new Date().getFullYear();

  constructor(private studentService: StudentService) {
    this.student$ = this.studentService.getStudent();
  }
}
