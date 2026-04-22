import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-nx-welcome',
  templateUrl: './nx-welcome.component.html',
  styleUrls: ['./nx-welcome.component.scss'],
})
export class NxWelcomeComponent {
  contacts = [
    { name: 'Alice Johnson', initials: 'AJ', status: 'Online',  online: true,  color: 'bg-blue-500'   },
    { name: 'Bob Smith',     initials: 'BS', status: 'Away',    online: false, color: 'bg-green-500'  },
    { name: 'Carol White',   initials: 'CW', status: 'Online',  online: true,  color: 'bg-purple-500' },
    { name: 'David Lee',     initials: 'DL', status: 'Busy',    online: false, color: 'bg-red-500'    },
    { name: 'Eva Brown',     initials: 'EB', status: 'Online',  online: true,  color: 'bg-yellow-500' },
    { name: 'Frank Kim',     initials: 'FK', status: 'Offline', online: false, color: 'bg-pink-500'   },
  ];
}
