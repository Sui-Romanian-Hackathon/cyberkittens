
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
}

export interface Source {
  uri: string;
  title: string;
}
